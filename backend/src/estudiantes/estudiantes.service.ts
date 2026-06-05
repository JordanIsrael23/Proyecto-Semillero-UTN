import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { validarCedulaEcuatoriana } from '../utils/validation';

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  async findEstudianteByCedula(cedula: string) {
    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { cedula },
      include: {
        familia_estudiante: {
          include: {
            perfil_familias: {
              include: {
                usuarios: true,
              },
            },
          },
        },
      },
    });
    if (!estudiante) return null;

    // Formatear la fecha de nacimiento para el input date (YYYY-MM-DD)
    const formattedFechaNacimiento = estudiante.fecha_nacimiento
      ? new Date(estudiante.fecha_nacimiento).toISOString().split('T')[0]
      : '';

    return {
      ...estudiante,
      fecha_nacimiento: formattedFechaNacimiento,
      familia_estudiante: estudiante.familia_estudiante.map((fe) => {
        const famUser = fe.perfil_familias.usuarios;
        return {
          parentesco: fe.parentesco,
          es_representante_principal: fe.es_representante_principal,
          familias: {
            id: fe.perfil_familias.usuario_id,
            usuario_id: fe.perfil_familias.usuario_id,
            nombre: famUser.nombre,
            apellido: famUser.apellido,
            telefono: famUser.telefono,
            direccion: fe.perfil_familias.direccion,
          },
        };
      }),
    };
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

    return this.prisma.$transaction(async (tx) => {
      let estudiante;
      if (existingEst) {
        // Si ya existe, lo actualizamos (lo cambiamos de grupo, actualizamos datos y lo activamos)
        estudiante = await tx.estudiantes.update({
          where: { id: existingEst.id },
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            grupo_id: data.grupo_id,
            fecha_nacimiento: new Date(data.fecha_nacimiento),
            activo: true,
          },
        });

        if (data.representante_id) {
          // Desvincular relaciones anteriores de familia_estudiante para este estudiante
          await tx.familia_estudiante.deleteMany({
            where: { estudiante_id: estudiante.id },
          });

          await tx.familia_estudiante.create({
            data: {
              familia_id: data.representante_id,
              estudiante_id: estudiante.id,
              parentesco: data.parentesco || 'Representante',
              es_representante_principal: true,
            },
          });
        }
      } else {
        // Si no existe, lo creamos
        estudiante = await tx.estudiantes.create({
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
              es_representante_principal: true,
            },
          });
        }
      }

      return {
        ...estudiante,
      };
    });
  }

  async updateEstudiante(id: string, data: { nombre: string; apellido: string; grupo_id: string; fecha_nacimiento: string; activo?: boolean }) {
    const estudiante = await this.prisma.estudiantes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        grupo_id: data.grupo_id,
        fecha_nacimiento: new Date(data.fecha_nacimiento),
        activo: data.activo !== undefined ? data.activo : true,
      },
    });

    return {
      ...estudiante,
    };
  }

  async deleteEstudiante(id: string) {
    // RNF-06: No eliminamos físicamente de evaluaciones, pero para alumnos permitimos baja lógica (activo = false)
    return this.prisma.estudiantes.update({
      where: { id },
      data: { activo: false },
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

  async getInformeCompletoEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiantes.findUnique({
      where: { id: estudianteId },
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

    const fichaMonitoreo = await this.prisma.fichas_monitoreo.findFirst({
      where: { estudiante_id: estudianteId },
      orderBy: { fecha_monitoreo: 'desc' },
    });

    const tareasCasa = await this.prisma.actividades_casa_seguimiento.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        actividades: true,
      },
    });

    const docUser = estudiante.grupos.perfil_docentes.usuarios;

    const mappedEstudiante = {
      ...estudiante,
      grupos: {
        ...estudiante.grupos,
        docentes: {
          id: estudiante.grupos.perfil_docentes.usuario_id,
          usuario_id: estudiante.grupos.perfil_docentes.usuario_id,
          nombre: docUser.nombre,
          apellido: docUser.apellido,
          telefono: docUser.telefono,
          especialidad: estudiante.grupos.perfil_docentes.especialidad,
        },
      },
    };

    const mappedTareasCasa = tareasCasa.map((t) => ({
      ...t,
      nota: t.nota_docente, // mapear para compatibilidad con el frontend
    }));

    return {
      estudiante: mappedEstudiante,
      evaluaciones,
      fichaMonitoreo,
      tareasCasa: mappedTareasCasa,
    };
  }
}
