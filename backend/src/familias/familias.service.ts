import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { validarCedulaEcuatoriana, validarSoloLetrasYEspacios, validarSoloNumeros } from '../utils/validation';

@Injectable()
export class FamiliasService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFamiliaByUsuarioId(usuarioId: string) {
    const familia = await this.prisma.perfil_familias.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!familia) throw new NotFoundException('Familia/Representante no encontrado para este usuario.');
    return familia;
  }

  async findFamiliaByCedula(cedula: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { cedula },
      include: { perfil_familias: true },
    });
    if (!usuario || usuario.rol_id !== 3 || !usuario.perfil_familias) {
      return null;
    }
    return {
      id: usuario.perfil_familias.usuario_id,
      cedula: usuario.cedula,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      direccion: usuario.perfil_familias.direccion,
    };
  }

  async createFamilia(data: { cedula?: string; email: string; nombre: string; apellido: string; telefono?: string; direccion?: string }) {
    if (data.nombre && !validarSoloLetrasYEspacios(data.nombre)) {
      throw new BadRequestException('El nombre ingresado contiene caracteres no permitidos. Solo se permiten letras y espacios.');
    }
    if (data.apellido && !validarSoloLetrasYEspacios(data.apellido)) {
      throw new BadRequestException('El apellido ingresado contiene caracteres no permitidos. Solo se permiten letras y espacios.');
    }
    if (data.telefono && !validarSoloNumeros(data.telefono)) {
      throw new BadRequestException('El número de teléfono ingresado contiene caracteres no permitidos. Solo se permiten números.');
    }

    // Verificar si el correo ya existe
    const existingEmail = await this.prisma.usuarios.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // Si se provee cédula, verificar si la cédula ya existe o es de estudiante
    if (data.cedula) {
      if (!validarCedulaEcuatoriana(data.cedula)) {
        throw new BadRequestException('La cédula del representante no es una cédula ecuatoriana válida.');
      }

      const existingCedula = await this.prisma.usuarios.findUnique({
        where: { cedula: data.cedula },
      });
      if (existingCedula) {
        throw new BadRequestException('La cédula del representante ya está registrada.');
      }

      const isStudentCedula = await this.prisma.estudiantes.findUnique({
        where: { cedula: data.cedula },
      });
      if (isStudentCedula) {
        throw new BadRequestException('La cédula ingresada pertenece a un estudiante y no puede registrarse como representante.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const targetCedula = data.cedula || 'TEMP_' + Date.now();
      const passwordHash = await bcrypt.hash(targetCedula, 10);
      const user = await tx.usuarios.create({
        data: {
          cedula: targetCedula,
          email: data.email,
          password_hash: passwordHash,
          rol_id: 3, // 'familia'
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono || null,
          activo: true,
        },
      });

      const pFamilia = await tx.perfil_familias.create({
        data: {
          usuario_id: user.id,
          direccion: data.direccion || '',
        },
        include: {
          usuarios: true,
        },
      });

      return {
        id: pFamilia.usuario_id,
        usuario_id: pFamilia.usuario_id,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: user.telefono,
        usuarios: pFamilia.usuarios,
      };
    });
  }

  async getHijosByFamilia(usuarioId: string) {
    const familia = await this.getFamiliaByUsuarioId(usuarioId);
    const relaciones = await this.prisma.familia_estudiante.findMany({
      where: { familia_id: familia.usuario_id },
      include: {
        estudiantes: {
          include: {
            grupos: {
              include: {
                perfil_docentes: {
                  include: {
                    usuarios: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return relaciones.map((rel) => {
      const docUser = rel.estudiantes.grupos.perfil_docentes.usuarios;

      return {
        parentesco: rel.parentesco,
        estudiante: {
          ...rel.estudiantes,
        },
        grupo: rel.estudiantes.grupos,
        docente: {
          id: rel.estudiantes.grupos.perfil_docentes.usuario_id,
          usuario_id: rel.estudiantes.grupos.perfil_docentes.usuario_id,
          nombre: docUser.nombre,
          apellido: docUser.apellido,
          telefono: docUser.telefono,
          especialidad: rel.estudiantes.grupos.perfil_docentes.especialidad,
        },
      };
    });
  }

  async getActividadesCasaByEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { id: estudianteId },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    const actividadesCasa = await this.prisma.actividades.findMany({
      where: {
        tipo: 'casa',
        unidades_didacticas: {
          estado: 'activo',
          grupo_id: estudiante.grupo_id,
        },
      },
      include: {
        unidades_didacticas: true,
        actividades_casa_seguimiento: {
          where: { estudiante_id: estudianteId },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    return actividadesCasa.map((act) => {
      const seg = act.actividades_casa_seguimiento[0];
      return {
        id: act.id,
        titulo: act.titulo,
        descripcion: act.descripcion,
        recursos_enlaces: act.recursos_enlaces,
        fecha_limite: act.fecha_limite,
        unidad_titulo: act.unidades_didacticas.titulo,
        realizada: seg ? seg.realizada : false,
        fecha_realizacion: seg ? seg.fecha_realizacion : null,
        comentario_familia: seg ? seg.comentario_familia : null,
        seguimiento_id: seg ? seg.id : null,
        nota: seg && seg.nota_docente !== null ? String(seg.nota_docente) : null,
      };
    });
  }

  async saveActividadCasaSeguimiento(data: { estudiante_id: string; actividad_id: string; realizada?: boolean; comentario_familia?: string; nota?: string; usuario_id?: string }) {
    const existing = await this.prisma.actividades_casa_seguimiento.findFirst({
      where: {
        estudiante_id: data.estudiante_id,
        actividad_id: data.actividad_id,
      },
    });

    let parsedNota: number | null = null;
    if (data.nota !== undefined && data.nota !== null && data.nota !== "") {
      const val = parseFloat(data.nota);
      if (!isNaN(val)) {
        parsedNota = val;
      }
    }

    if (existing) {
      return this.prisma.actividades_casa_seguimiento.update({
        where: { id: existing.id },
        data: {
          realizada: data.realizada !== undefined ? data.realizada : existing.realizada,
          fecha_realizacion: data.realizada !== undefined ? (data.realizada ? new Date() : null) : existing.fecha_realizacion,
          comentario_familia: data.comentario_familia !== undefined ? data.comentario_familia : existing.comentario_familia,
          nota_docente: data.nota !== undefined ? parsedNota : existing.nota_docente,
        },
      });
    }

    // Resolver la familia_id para esta actividad
    let familiaIdToSet = '';
    if (data.usuario_id) {
      const fam = await this.prisma.perfil_familias.findUnique({
        where: { usuario_id: data.usuario_id },
      });
      if (fam) {
        familiaIdToSet = fam.usuario_id;
      }
    }

    if (!familiaIdToSet) {
      const rel = await this.prisma.familia_estudiante.findFirst({
        where: { estudiante_id: data.estudiante_id },
        orderBy: { es_representante_principal: 'desc' },
      });
      if (rel) {
        familiaIdToSet = rel.familia_id;
      } else {
        // Fallback default
        familiaIdToSet = 'a0000000-0000-0000-0000-000000000003';
      }
    }

    return this.prisma.actividades_casa_seguimiento.create({
      data: {
        estudiante_id: data.estudiante_id,
        actividad_id: data.actividad_id,
        familia_id: familiaIdToSet,
        realizada: data.realizada || false,
        fecha_realizacion: data.realizada ? new Date() : null,
        comentario_familia: data.comentario_familia || null,
        nota_docente: parsedNota,
      },
    });
  }
}
