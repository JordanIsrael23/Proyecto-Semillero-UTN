import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { validarCedulaEcuatoriana } from '../utils/validation';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

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
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password_raw, user.password_hash);
    } catch (err) {
      throw new UnauthorizedException('Error al validar las credenciales.');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (contraseña incorrecta).');
    }

    // Obtener detalles del perfil según el rol
    let perfil: any = null;
    if (user.rol_id === 2) { // docente
      const pDocente = await this.prisma.perfil_docentes.findUnique({
        where: { usuario_id: user.id },
      });
      if (pDocente) {
        perfil = {
          id: pDocente.usuario_id,
          usuario_id: pDocente.usuario_id,
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          especialidad: pDocente.especialidad,
        };
      }
    } else if (user.rol_id === 3) { // familia
      const pFamilia = await this.prisma.perfil_familias.findUnique({
        where: { usuario_id: user.id },
      });
      if (pFamilia) {
        perfil = {
          id: pFamilia.usuario_id,
          usuario_id: pFamilia.usuario_id,
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          direccion: pFamilia.direccion,
        };
      }
    }

    // Retornar información de sesión (sin el hash de contraseña)
    const { password_hash, ...userInfoWithoutPassword } = user;
    const rolName = user.rol_id === 1 ? 'admin' : user.rol_id === 2 ? 'docente' : 'familia';

    const userInfo = {
      ...userInfoWithoutPassword,
      rol: rolName,
    };

    const payload = { sub: user.id, cedula: user.cedula, rol: rolName };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
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
    const rol_id = data.rol === 'docente' ? 2 : 3;

    // Crear el usuario y el perfil en una transacción
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuarios.create({
        data: {
          cedula: data.cedula,
          email: data.email,
          password_hash,
          rol_id: rol_id,
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono || null,
          activo: true,
        },
      });

      let perfil: any = null;
      if (data.rol === 'docente') {
        const pDocente = await tx.perfil_docentes.create({
          data: {
            usuario_id: user.id,
            especialidad: 'Desarrollo Cognitivo Infantil',
          },
        });
        perfil = {
          id: pDocente.usuario_id,
          usuario_id: pDocente.usuario_id,
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: user.telefono,
          especialidad: pDocente.especialidad,
        };
      } else if (data.rol === 'familia') {
        const pFamilia = await tx.perfil_familias.create({
          data: {
            usuario_id: user.id,
            direccion: '',
          },
        });
        perfil = {
          id: pFamilia.usuario_id,
          usuario_id: pFamilia.usuario_id,
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: user.telefono,
          direccion: pFamilia.direccion,
        };
      }

      const { password_hash: _, ...userInfoWithoutPassword } = user;
      const userInfo = {
        ...userInfoWithoutPassword,
        rol: data.rol,
      };

      return {
        user: userInfo,
        perfil,
      };
    });
  }
}
