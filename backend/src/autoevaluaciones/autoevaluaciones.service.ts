import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { respuesta_autoevaluacion } from '@prisma/client';

@Injectable()
export class AutoevaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  async saveAutoevaluacion(usuarioId: string, data: { unidad_didactica_id?: string; reflexion?: string; respuestas: { numero_pregunta: number; respuesta: respuesta_autoevaluacion }[] }) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);

    return this.prisma.$transaction(async (tx) => {
      const autoeval = await tx.autoevaluaciones_docente.create({
        data: {
          docente_id: docente.id,
          unidad_didactica_id: data.unidad_didactica_id || null,
          reflexion: data.reflexion,
        },
      });

      for (const resp of data.respuestas) {
        await tx.respuestas_autoevaluacion.create({
          data: {
            autoevaluacion_id: autoeval.id,
            numero_pregunta: resp.numero_pregunta,
            respuesta: resp.respuesta,
          },
        });
      }

      return tx.autoevaluaciones_docente.findUnique({
        where: { id: autoeval.id },
        include: { respuestas_autoevaluacion: true },
      });
    });
  }

  async getAutoevaluacionesByUnidad(unidadId: string) {
    return this.prisma.autoevaluaciones_docente.findMany({
      where: { unidad_didactica_id: unidadId },
      include: { respuestas_autoevaluacion: true },
      orderBy: { fecha_creacion: 'desc' },
    });
  }
}
