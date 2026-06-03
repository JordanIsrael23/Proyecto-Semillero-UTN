import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MonitoreoService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  async getFichaMonitoreo(estudianteId: string) {
    return this.prisma.fichas_monitoreo.findFirst({
      where: { estudiante_id: estudianteId },
      orderBy: { fecha_monitoreo: 'desc' },
    });
  }

  async saveFichaMonitoreo(usuarioId: string, estudianteId: string, data: { clasificacion: string; seriacion: string; asimilacion_acomodacion: string; justificacion_logica: string; autorregulacion: string; observaciones?: string; acciones_apoyo?: string }) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);

    const existing = await this.prisma.fichas_monitoreo.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (existing) {
      return this.prisma.fichas_monitoreo.update({
        where: { id: existing.id },
        data: {
          clasificacion: data.clasificacion,
          seriacion: data.seriacion,
          asimilacion_acomodacion: data.asimilacion_acomodacion,
          justificacion_logica: data.justificacion_logica,
          autorregulacion: data.autorregulacion,
          observaciones: data.observaciones,
          acciones_apoyo: data.acciones_apoyo,
          fecha_actualizacion: new Date(),
        },
      });
    }

    return this.prisma.fichas_monitoreo.create({
      data: {
        estudiante_id: estudianteId,
        docente_id: docente.id,
        clasificacion: data.clasificacion,
        seriacion: data.seriacion,
        asimilacion_acomodacion: data.asimilacion_acomodacion,
        justificacion_logica: data.justificacion_logica,
        autorregulacion: data.autorregulacion,
        observaciones: data.observaciones,
        acciones_apoyo: data.acciones_apoyo,
      },
    });
  }
}
