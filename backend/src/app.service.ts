import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { estado_unidad, tipo_actividad, respuesta_autoevaluacion } from '@prisma/client';
import { validarCedulaEcuatoriana } from './utils/validation';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // 1. SIMULACIÓN DE SESIONES (Lista de usuarios cargados para el Frontend Selector)
  // --------------------------------------------------------------------------
  async getUsers() {
    return this.prisma.usuarios.findMany({
      include: {
        docentes: true,
        familias: true,
      },
      orderBy: { email: 'asc' },
    });
  }

  // Helper para buscar el perfil Docente asociado a un usuario
  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  // Helper para buscar el perfil Familia asociado a un usuario
  private async getFamiliaByUsuarioId(usuarioId: string) {
    const familia = await this.prisma.familias.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!familia) throw new NotFoundException('Familia/Representante no encontrado para este usuario.');
    return familia;
  }

  async createFamilia(data: { email: string; nombre: string; apellido: string; telefono?: string }) {
    // Verificar si el correo ya existe
    const existing = await this.prisma.usuarios.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Nota: Para mantener compatibilidad con el endpoint antiguo,
      // generamos una cédula temporal o vacía si no se especifica.
      // Pero como cedula es UNIQUE, usamos el email o un random/timestamp.
      const tempCedula = 'TEMP_' + Date.now();
      const user = await tx.usuarios.create({
        data: {
          cedula: tempCedula,
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

  // --------------------------------------------------------------------------
  // 2. GESTIÓN DE GRUPOS Y ESTUDIANTES (RF-D01)
  // --------------------------------------------------------------------------
  async getGruposByDocente(usuarioId: string) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);
    return this.prisma.grupos.findMany({
      where: { docente_id: docente.id, activo: true },
      include: {
        _count: {
          select: { estudiantes: { where: { activo: true } } },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getEstudiantesByGrupo(grupoId: string) {
    return this.prisma.estudiantes.findMany({
      where: { grupo_id: grupoId, activo: true },
      include: {
        familia_estudiante: {
          include: {
            familias: true,
          },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  async createEstudiante(data: {
    cedula: string;
    nombre: string;
    apellido: string;
    grupo_id: string;
    fecha_nacimiento: string;
    representante_id?: string;
    parentesco?: string;
  }) {
    // Validar formato y dígito verificador de la cédula ecuatoriana del estudiante
    if (!validarCedulaEcuatoriana(data.cedula)) {
      throw new BadRequestException('La cédula del estudiante no es una cédula ecuatoriana válida.');
    }

    // Validar cédula única en estudiantes
    const existingEst = await this.prisma.estudiantes.findUnique({
      where: { cedula: data.cedula },
    });
    if (existingEst) {
      throw new BadRequestException('La cédula del estudiante ya está registrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      const estudiante = await tx.estudiantes.create({
        data: {
          cedula: data.cedula,
          nombre: data.nombre,
          apellido: data.apellido,
          grupo_id: data.grupo_id,
          fecha_nacimiento: new Date(data.fecha_nacimiento),
          activo: true,
        },
      });

      if (data.representante_id) {
        await tx.familia_estudiante.create({
          data: {
            familia_id: data.representante_id,
            estudiante_id: estudiante.id,
            parentesco: data.parentesco || 'Representante',
          },
        });
      }

      return estudiante;
    });
  }

  async updateEstudiante(id: string, data: { nombre: string; apellido: string; grupo_id: string; fecha_nacimiento: string; activo?: boolean }) {
    return this.prisma.estudiantes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        grupo_id: data.grupo_id,
        fecha_nacimiento: new Date(data.fecha_nacimiento),
        activo: data.activo !== undefined ? data.activo : true,
      },
    });
  }

  async deleteEstudiante(id: string) {
    // RNF-06: No eliminamos físicamente de evaluaciones, pero para alumnos permitimos baja lógica (activo = false)
    return this.prisma.estudiantes.update({
      where: { id },
      data: { activo: false },
    });
  }

  // --------------------------------------------------------------------------
  // 3. PLANIFICACIÓN PEDAGÓGICA (UNIDADES Y ACTIVIDADES) (RF-D02)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 4. RÚBRICA Y REGISTRO DE EVALUACIONES (RF-D03, RF-D04, RF-D05, RF-F02, RF-F03)
  // --------------------------------------------------------------------------
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
          docente_id: docente.id,
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

  async getHistorialEstudiante(estudianteId: string) {
    return this.prisma.evaluaciones_criterio.findMany({
      where: { estudiante_id: estudianteId, activa: true },
      include: {
        criterios_evaluacion: true,
        niveles_logro: true,
        unidades_didacticas: true,
      },
      orderBy: { fecha_evaluacion: 'desc' },
    });
  }

  async getConsolidadoGrupo(grupoId: string) {
    const evaluaciones = await this.prisma.evaluaciones_criterio.findMany({
      where: {
        estudiantes: { grupo_id: grupoId, activo: true },
        activa: true,
      },
      include: {
        criterios_evaluacion: true,
        niveles_logro: true,
      },
    });

    const conteo = {};

    evaluaciones.forEach((ev) => {
      const critName = ev.criterios_evaluacion.nombre;
      const nivelLogro = ev.niveles_logro.nombre;

      if (!conteo[critName]) {
        conteo[critName] = { Iniciado: 0, 'En Proceso': 0, Logrado: 0 };
      }
      if (nivelLogro in conteo[critName]) {
        conteo[critName][nivelLogro]++;
      }
    });

    return Object.keys(conteo).map((crit) => ({
      criterio: crit,
      iniciado: conteo[crit].Iniciado,
      enProceso: conteo[crit]['En Proceso'],
      logrado: conteo[crit].Logrado,
    }));
  }

  // --------------------------------------------------------------------------
  // 5. FICHA DE MONITOREO INDIVIDUAL (RF-D06)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 6. AUTOEVALUACIÓN DOCENTE (RF-D07)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 7. MÓDULO FAMILIA Y TAREAS EN CASA (RF-F01, RF-F04)
  // --------------------------------------------------------------------------
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
      };
    });
  }

  async saveActividadCasaSeguimiento(data: { estudiante_id: string; actividad_id: string; realizada: boolean; comentario_familia?: string }) {
    const existing = await this.prisma.actividades_casa_seguimiento.findFirst({
      where: {
        estudiante_id: data.estudiante_id,
        actividad_id: data.actividad_id,
      },
    });

    if (existing) {
      return this.prisma.actividades_casa_seguimiento.update({
        where: { id: existing.id },
        data: {
          realizada: data.realizada,
          fecha_realizacion: data.realizada ? new Date() : null,
          comentario_familia: data.comentario_familia,
        },
      });
    }

    return this.prisma.actividades_casa_seguimiento.create({
      data: {
        estudiante_id: data.estudiante_id,
        actividad_id: data.actividad_id,
        realizada: data.realizada,
        fecha_realizacion: data.realizada ? new Date() : null,
        comentario_familia: data.comentario_familia,
      },
    });
  }

  // --------------------------------------------------------------------------
  // 8. INFORMES Y METRICAS EXPORTABLES (RF-D10)
  // --------------------------------------------------------------------------
  async getInformeCompletoEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { id: estudianteId },
      include: {
        grupos: {
          include: {
            docentes: true,
          },
        },
      },
    });

    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    const evaluaciones = await this.prisma.evaluaciones_criterio.findMany({
      where: { estudiante_id: estudianteId, activa: true },
      include: {
        criterios_evaluacion: true,
        niveles_logro: true,
        unidades_didacticas: true,
      },
      orderBy: { fecha_evaluacion: 'desc' },
    });

    const fichaMonitoreo = await this.getFichaMonitoreo(estudianteId);

    const tareasCasa = await this.prisma.actividades_casa_seguimiento.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        actividades: true,
      },
    });

    return {
      estudiante,
      evaluaciones,
      fichaMonitoreo,
      tareasCasa,
    };
  }
}
