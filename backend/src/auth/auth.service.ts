import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { validarCedulaEcuatoriana } from '../utils/validation';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(cedulaOrEmail: string, password_raw: string) {
    // Buscar el usuario por email o por cédula
    const user = await this.prisma.usuarios.findFirst({
      where: {
        OR: [
          { email: cedulaOrEmail },
          { cedula: cedulaOrEmail },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (usuario no encontrado).');
    }

    if (!user.activo) {
      throw new UnauthorizedException('El usuario está inactivo.');
    }

    // Verificar contraseña
    // En el seed anterior y en el registro actual encriptamos con bcrypt.
    // Nota: Si por alguna razón la contraseña es texto plano o un formato antiguo, fallará,
    // pero con bcrypt.compare manejamos el login seguro estándar.
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password_raw, user.password_hash);
    } catch (err) {
      // Si falla bcrypt (por ejemplo, si el hash no es válido), lanzamos excepción
      throw new UnauthorizedException('Error al validar las credenciales.');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (contraseña incorrecta).');
    }

    // Obtener detalles del perfil según el rol
    let perfil: any = null;
    if (user.rol === 'docente') {
      perfil = await this.prisma.docentes.findUnique({
        where: { usuario_id: user.id },
      });
    } else if (user.rol === 'familia') {
      perfil = await this.prisma.familias.findUnique({
        where: { usuario_id: user.id },
      });
    }

    // Retornar información de sesión (sin el hash de contraseña)
    const { password_hash, ...userInfo } = user;
    return {
      user: userInfo,
      perfil,
    };
  }

  async register(data: {
    cedula: string;
    email: string;
    password_raw: string;
    rol: 'docente' | 'familia';
    nombre: string;
    apellido: string;
    telefono?: string;
  }) {
    // Validar formato y dígito verificador de la cédula ecuatoriana
    if (!validarCedulaEcuatoriana(data.cedula)) {
      throw new BadRequestException('La cédula ingresada no es una cédula ecuatoriana válida.');
    }

    // Validar si la cédula o el email ya existen
    const existingUser = await this.prisma.usuarios.findFirst({
      where: {
        OR: [
          { email: data.email },
          { cedula: data.cedula },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.cedula === data.cedula) {
        throw new BadRequestException('La cédula ingresada ya está registrada.');
      }
      if (existingUser.email === data.email) {
        throw new BadRequestException('El correo electrónico ya está registrado.');
      }
    }

    // Encriptar la contraseña con bcrypt
    const password_hash = await bcrypt.hash(data.password_raw, 10);

    // Crear el usuario y el perfil en una transacción
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuarios.create({
        data: {
          cedula: data.cedula,
          email: data.email,
          password_hash,
          rol: data.rol,
          activo: true,
        },
      });

      let perfil: any = null;
      if (data.rol === 'docente') {
        perfil = await tx.docentes.create({
          data: {
            usuario_id: user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            telefono: data.telefono || null,
          },
        });
      } else if (data.rol === 'familia') {
        perfil = await tx.familias.create({
          data: {
            usuario_id: user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            telefono: data.telefono || null,
          },
        });
      }

      const { password_hash: _, ...userInfo } = user;
      return {
        user: userInfo,
        perfil,
      };
    });
  }
}
