import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { estado_unidad, tipo_actividad } from '@prisma/client';

@Injectable()
export class UnidadesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  async getUnidadesByDocente(usuarioId: string) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);
    return this.prisma.unidades_didacticas.findMany({
      where: { docente_id: docente.id },
      include: {
        actividades: true,
      },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async createUnidad(usuarioId: string, data: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);
    return this.prisma.unidades_didacticas.create({
      data: {
        titulo: data.titulo,
        resumen: data.resumen,
        ambito: data.ambito,
        objetivos_generales: data.objetivos_generales,
        objetivos_aprendizaje: data.objetivos_aprendizaje,
        destrezas: data.destrezas,
        semanas_previstas: Number(data.semanas_previstas),
        docente_id: docente.id,
        estado: data.estado || 'borrador',
      },
    });
  }

  async updateUnidad(id: string, data: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }) {
    return this.prisma.unidades_didacticas.update({
      where: { id },
      data: {
        titulo: data.titulo,
        resumen: data.resumen,
        ambito: data.ambito,
        objetivos_generales: data.objetivos_generales,
        objetivos_aprendizaje: data.objetivos_aprendizaje,
        destrezas: data.destrezas,
        semanas_previstas: Number(data.semanas_previstas),
        estado: data.estado,
        fecha_actualizacion: new Date(),
      },
    });
  }

  async cloneUnidad(id: string, usuarioId: string) {
    const original = await this.prisma.unidades_didacticas.findUnique({
      where: { id },
      include: { actividades: true },
    });
    if (!original) throw new NotFoundException('Unidad original no encontrada');

    return this.prisma.$transaction(async (tx) => {
      const cloned = await tx.unidades_didacticas.create({
        data: {
          titulo: `${original.titulo} (Clon)`,
          resumen: original.resumen,
          ambito: original.ambito,
          objetivos_generales: original.objetivos_generales,
          objetivos_aprendizaje: original.objetivos_aprendizaje,
          destrezas: original.destrezas,
          semanas_previstas: original.semanas_previstas,
          docente_id: original.docente_id,
          estado: 'borrador',
        },
      });

      for (const act of original.actividades) {
        await tx.actividades.create({
          data: {
            unidad_id: cloned.id,
            titulo: act.titulo,
            descripcion: act.descripcion,
            tipo: act.tipo,
            recursos_enlaces: act.recursos_enlaces || undefined,
          },
        });
      }

      return cloned;
    });
  }

  async createActividad(unidadId: string, data: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.prisma.actividades.create({
      data: {
        unidad_id: unidadId,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        recursos_enlaces: data.recursos_enlaces || [],
      },
    });
  }

  async updateActividad(id: string, data: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.prisma.actividades.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        recursos_enlaces: data.recursos_enlaces || [],
        fecha_actualizacion: new Date(),
      },
    });
  }

  async deleteActividad(id: string) {
    return this.prisma.actividades.delete({ where: { id } });
  }
}
