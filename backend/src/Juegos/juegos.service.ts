import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { criterio_didactico } from '@prisma/client';

export interface CreateMetricaPayload {
  actividadId: string;
  estudianteId: string;
  appCriterio: criterio_didactico;
  duracionSesion: string;
  intentosPorElemento: number;
  tasaAcierto: number;
  secuenciaDecisiones: any;
  usoAyudas: number;
  nivelCompletado: number;
  abandono: boolean;
}

@Injectable()
export class JuegosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerActividad(idActividad: string, cedulaEstudiante: string) {
    const actividad = await this.prisma.actividades.findUnique({
      where: { id: idActividad },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
      },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { cedula: cedulaEstudiante },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return {
      idActividad: actividad.id,
      idEstudiante: estudiante.id,
      tituloActividad: actividad.titulo,
      descripcionActividad: actividad.descripcion,
    };
  }

  async registrarMetrica(payload: CreateMetricaPayload) {
    // Validar formato básico de UUID para actividadId
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(payload.actividadId)) {
      throw new BadRequestException('El actividadId debe ser un UUID válido.');
    }

    let estudianteUuid = payload.estudianteId;

    // Si no es un UUID, asumimos que es una cédula y buscamos el UUID
    if (!uuidRegex.test(payload.estudianteId)) {
      const estudiante = await this.prisma.estudiantes.findUnique({
        where: { cedula: payload.estudianteId },
      });
      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado con la cédula proporcionada.');
      }
      estudianteUuid = estudiante.id;
    }

    return this.prisma.$transaction(async (prisma) => {
      const metrica = await prisma.metricas_sesion.create({
        data: {
          actividad_id: payload.actividadId,
          estudiante_id: estudianteUuid,
          app_criterio: payload.appCriterio,
        },
      });

      const detalle = await prisma.detalles_metricas_sesion.create({
        data: {
          metrica_sesion_id: metrica.id,
          duracion_sesion: payload.duracionSesion,
          intentos_por_elemento: payload.intentosPorElemento,
          tasa_acierto: payload.tasaAcierto,
          secuencia_decisiones: payload.secuenciaDecisiones,
          uso_ayudas: payload.usoAyudas,
          nivel_completado: payload.nivelCompletado,
          abandono: payload.abandono,
        },
      });

      return { metrica, detalle };
    });
  }
}
