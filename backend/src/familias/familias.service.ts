import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FamiliasService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFamiliaByUsuarioId(usuarioId: string) {
    const familia = await this.prisma.familias.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!familia) throw new NotFoundException('Familia/Representante no encontrado para este usuario.');
    return familia;
  }

  async findFamiliaByCedula(cedula: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { cedula },
      include: { familias: true },
    });
    if (!usuario || usuario.rol !== 'familia' || !usuario.familias) {
      return null;
    }
    return {
      id: usuario.familias.id,
      cedula: usuario.cedula,
      email: usuario.email,
      nombre: usuario.familias.nombre,
      apellido: usuario.familias.apellido,
      telefono: usuario.familias.telefono,
    };
  }

  async createFamilia(data: { cedula?: string; email: string; nombre: string; apellido: string; telefono?: string }) {
    // Verificar si el correo ya existe
    const existingEmail = await this.prisma.usuarios.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // Si se provee cédula, verificar si la cédula ya existe
    if (data.cedula) {
      const existingCedula = await this.prisma.usuarios.findUnique({
        where: { cedula: data.cedula },
      });
      if (existingCedula) {
        throw new BadRequestException('La cédula del representante ya está registrada.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const targetCedula = data.cedula || 'TEMP_' + Date.now();
      const user = await tx.usuarios.create({
        data: {
          cedula: targetCedula,
          email: data.email,
          password_hash: '$2b$10$wR1lBghQo9U17B576/Hjue/96slyD6ZcW6e4t2M56r1g2L6vS7npe', // hash de password123
          rol: 'familia',
          activo: true,
        },
      });

      const familia = await tx.familias.create({
        data: {
          usuario_id: user.id,
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono || null,
        },
        include: {
          usuarios: true,
        },
      });

      return familia;
    });
  }

  async getHijosByFamilia(usuarioId: string) {
    const familia = await this.getFamiliaByUsuarioId(usuarioId);
    const relaciones = await this.prisma.familia_estudiante.findMany({
      where: { familia_id: familia.id },
      include: {
        estudiantes: {
          include: {
            grupos: {
              include: {
                docentes: true,
              },
            },
          },
        },
      },
    });

    return relaciones.map((rel) => ({
      parentesco: rel.parentesco,
      estudiante: rel.estudiantes,
      grupo: rel.estudiantes.grupos,
      docente: rel.estudiantes.grupos.docentes,
    }));
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
        unidad_titulo: act.unidades_didacticas.titulo,
        realizada: seg ? seg.realizada : false,
        fecha_realizacion: seg ? seg.fecha_realizacion : null,
        comentario_familia: seg ? seg.comentario_familia : null,
        seguimiento_id: seg ? seg.id : null,
        nota: seg && seg.nota !== null ? String(seg.nota) : null,
      };
    });
  }

  async saveActividadCasaSeguimiento(data: { estudiante_id: string; actividad_id: string; realizada?: boolean; comentario_familia?: string; nota?: string }) {
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
          nota: data.nota !== undefined ? parsedNota : existing.nota,
        },
      });
    }

    return this.prisma.actividades_casa_seguimiento.create({
      data: {
        estudiante_id: data.estudiante_id,
        actividad_id: data.actividad_id,
        realizada: data.realizada || false,
        fecha_realizacion: data.realizada ? new Date() : null,
        comentario_familia: data.comentario_familia || null,
        nota: parsedNota,
      },
    });
  }
}
