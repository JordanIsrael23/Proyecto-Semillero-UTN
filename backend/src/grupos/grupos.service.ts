import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDocenteByUsuarioId(usuarioId: string) {
    const docente = await this.prisma.perfil_docentes.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!docente) throw new NotFoundException('Docente no encontrado para este usuario.');
    return docente;
  }

  async getGruposByDocente(usuarioId: string) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);
    return this.prisma.grupos.findMany({
      where: { docente_id: docente.usuario_id, activo: true },
      include: {
        _count: {
          select: { estudiantes: { where: { activo: true } } },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async createGroup(nombre: string, usuarioId: string) {
    const docente = await this.getDocenteByUsuarioId(usuarioId);
    
    // Consultar el periodo académico activo del sistema
    const config = await this.prisma.configuraciones_sistema.findUnique({
      where: { clave: 'PERIODO_ACTIVO' },
    });
    const periodo = config?.valor || '2026-1';

    return this.prisma.grupos.create({
      data: {
        nombre: nombre,
        periodo_academico: periodo,
        docente_id: docente.usuario_id,
        activo: true,
      },
    });
  }

  async getEstudiantesByGrupo(grupoId: string) {
    const students = await this.prisma.estudiantes.findMany({
      where: { grupo_id: grupoId, activo: true },
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
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    });

    return students.map((est) => {
      return {
        ...est,
        familia_estudiante: est.familia_estudiante.map((fe) => {
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
}
