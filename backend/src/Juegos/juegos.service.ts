import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { criterio_didactico } from '@prisma/client';

// Payload para crear una sesión de juego (llamado por el docente)
export interface CrearSesionPayload {
  actividadId: string;
  estudianteId: string; // Puede ser UUID o cédula
  appCriterio: criterio_didactico;
}

// Payload para registrar los detalles del juego (llamado por la app de juego)
export interface RegistrarDetallesPayload {
  duracionSesion: string;
  intentosPorElemento: number;
  tasaAcierto: number;
  secuenciaDecisiones: any;
  usoAyudas: number;
  nivelCompletado: number;
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
   * Crea una sesión de juego (metricas_sesion) y genera un sessionToken JWT
   * para que la app de juego pueda consultar el contexto y enviar resultados.
   * Solo el docente autenticado puede llamar a este método.
   */
  async crearSesion(payload: CrearSesionPayload) {
    // Validar que actividadId sea un UUID válido
    if (!UUID_REGEX.test(payload.actividadId)) {
      throw new BadRequestException('El actividadId debe ser un UUID válido.');
    }

    // Resolver el estudianteId: puede ser UUID o cédula
    let estudianteUuid = payload.estudianteId;
    if (!UUID_REGEX.test(payload.estudianteId)) {
      const estudiante = await this.prisma.estudiantes.findUnique({
        where: { cedula: payload.estudianteId },
      });
      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado con la cédula proporcionada.');
      }
      estudianteUuid = estudiante.id;
    }

    // Verificar que la actividad existe y obtener sus datos
    const actividad = await this.prisma.actividades.findUnique({
      where: { id: payload.actividadId },
      select: { id: true, titulo: true, descripcion: true },
    });
    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada.');
    }

    // Obtener datos del estudiante
    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { id: estudianteUuid },
      select: { id: true, nombre: true, apellido: true },
    });
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    // Crear el registro de metricas_sesion
    const metricaSesion = await this.prisma.metricas_sesion.create({
      data: {
        actividad_id: payload.actividadId,
        estudiante_id: estudianteUuid,
        app_criterio: payload.appCriterio,
      },
    });

    // Generar un sessionToken JWT de corta duración para la app de juego
    const sessionToken = this.jwtService.sign(
      { sub: metricaSesion.id, type: 'game_session' },
      { expiresIn: '2h' },
    );

    return {
      sessionToken,
      metricaSesionId: metricaSesion.id,
      nombreEstudiante: estudiante.nombre,
      apellidoEstudiante: estudiante.apellido,
      appCriterio: payload.appCriterio,
      tituloActividad: actividad.titulo,
      descripcionActividad: actividad.descripcion,
    };
  }

  /**
   * Obtiene el contexto de una sesión de juego.
   * Llamado por la app de juego externa usando el sessionToken.
   */
  async obtenerSesion(metricaSesionId: string) {
    if (!UUID_REGEX.test(metricaSesionId)) {
      throw new BadRequestException('El metricaSesionId debe ser un UUID válido.');
    }

    const sesion = await this.prisma.metricas_sesion.findUnique({
      where: { id: metricaSesionId },
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
      throw new NotFoundException('Sesión de juego no encontrada.');
    }

    return {
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
        nivel_completado: payload.nivelCompletado,
        abandono: payload.abandono,
      },
    });

    return detalle;
  }
}
