import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.perfil_docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  async getCriterios() {
    return this.prisma.criterios_evaluacion.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    });
  }

  async getNivelesLogro() {
    return this.prisma.niveles_logro.findMany({
      orderBy: { orden: 'asc' },
    });
  }

  async registerEvaluacion(usuarioId: string, data: { estudiante_id: string; criterio_id: string; nivel_logro_id: string; unidad_didactica_id: string; observaciones?: string }) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);

    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar si hay una evaluación previa activa para este estudiante, criterio y unidad didáctica
      const prevActive = await tx.evaluaciones_criterio.findFirst({
        where: {
          estudiante_id: data.estudiante_id,
          criterio_id: data.criterio_id,
          unidad_didactica_id: data.unidad_didactica_id,
          activa: true,
        },
      });

      let nextVersion = 1;
      if (prevActive) {
        nextVersion = prevActive.version + 1;
        // RNF-06: No eliminamos físicamente, marcamos la anterior como inactiva
        await tx.evaluaciones_criterio.update({
          where: { id: prevActive.id },
          data: { activa: false },
        });
      }

      // 2. Crear la nueva evaluación versionada y activa
      return tx.evaluaciones_criterio.create({
        data: {
          estudiante_id: data.estudiante_id,
          criterio_id: data.criterio_id,
          nivel_logro_id: data.nivel_logro_id,
          unidad_didactica_id: data.unidad_didactica_id,
          docente_id: docente.usuario_id,
          observaciones: data.observaciones,
          version: nextVersion,
          activa: true,
        },
        include: {
          criterios_evaluacion: true,
          niveles_logro: true,
        },
      });
    });
  }
}
