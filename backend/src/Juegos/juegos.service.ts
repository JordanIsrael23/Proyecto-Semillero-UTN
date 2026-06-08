import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { criterio_didactico } from '@prisma/client';

// Payload para iniciar una sesión de juego (llamado por el docente)
export interface IniciarSesionPayload {
  metricaSesionId: string; // ID existente de la tabla metricas_sesion
}

// Payload para registrar los detalles del juego (llamado por la app de juego)
export interface RegistrarDetallesPayload {
  duracionSesion: string;
  intentosPorElemento: number;
  tasaAcierto: number;
  secuenciaDecisiones: any;
  usoAyudas: number;
  nivelDificultad: number;
  abandono: boolean;
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Injectable()
export class JuegosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Busca una sesión de juego existente (metricas_sesion) por su ID
   * y genera un sessionToken JWT con todo el contexto necesario
   * para que la app de juego pueda enviar resultados.
   * Solo el docente autenticado puede llamar a este método.
   */
  async iniciarSesion(payload: IniciarSesionPayload) {
    if (!UUID_REGEX.test(payload.metricaSesionId)) {
      throw new BadRequestException('El metricaSesionId debe ser un UUID válido.');
    }

    // Buscar la sesión existente con datos del estudiante y la actividad
    const sesion = await this.prisma.metricas_sesion.findUnique({
      where: { id: payload.metricaSesionId },
      include: {
        estudiantes: {
          select: { nombre: true, apellido: true },
        },
        actividades: {
          select: { titulo: true, descripcion: true },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión de métricas no encontrada.');
    }

    // Generar un sessionToken JWT de corta duración para la app de juego
    const sessionToken = this.jwtService.sign(
      { sub: sesion.id, type: 'game_session' },
      { expiresIn: '2h' },
    );

    return {
      sessionToken,
      metricaSesionId: sesion.id,
      nombreEstudiante: sesion.estudiantes.nombre,
      apellidoEstudiante: sesion.estudiantes.apellido,
      appCriterio: sesion.app_criterio,
      tituloActividad: sesion.actividades.titulo,
      descripcionActividad: sesion.actividades.descripcion,
    };
  }

  /**
   * Registra los detalles/resultados de una sesión de juego.
   * Llamado por la app de juego externa usando el sessionToken.
   */
  async registrarDetalles(metricaSesionId: string, payload: RegistrarDetallesPayload) {
    if (!UUID_REGEX.test(metricaSesionId)) {
      throw new BadRequestException('El metricaSesionId debe ser un UUID válido.');
    }

    // Verificar que la sesión existe
    const sesion = await this.prisma.metricas_sesion.findUnique({
      where: { id: metricaSesionId },
    });
    if (!sesion) {
      throw new NotFoundException('Sesión de juego no encontrada.');
    }

    // Crear el registro de detalles
    const detalle = await this.prisma.detalles_metricas_sesion.create({
      data: {
        metrica_sesion_id: metricaSesionId,
        duracion_sesion: payload.duracionSesion,
        intentos_por_elemento: payload.intentosPorElemento,
        tasa_acierto: payload.tasaAcierto,
        secuencia_decisiones: payload.secuenciaDecisiones,
        uso_ayudas: payload.usoAyudas,
        nivel_dificultad: payload.nivelDificultad,
        abandono: payload.abandono,
      },
    });

    return detalle;
  }
}
