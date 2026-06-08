import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { validarCedulaEcuatoriana } from '../utils/validation';

const ALLOWED_TABLES = [
  'roles',
  'usuarios',
  'perfil_docentes',
  'perfil_familias',
  'grupos',
  'estudiantes',
  'familia_estudiante',
  'unidades_didacticas',
  'actividades',
  'actividades_casa_seguimiento',
  'criterios_evaluacion',
  'niveles_logro',
  'evaluaciones_criterio',
  'fichas_monitoreo',
  'autoevaluaciones_docente',
  'respuestas_autoevaluacion',
  'configuraciones_sistema',
  'auditoria_logs',
];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.usuarios.findMany({
      include: {
        perfil_docentes: true,
        perfil_familias: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
    return users.map((user) => {
      const { password_hash, ...u } = user;
      return {
        ...u,
        rol: u.rol_id === 1 ? 'admin' : u.rol_id === 2 ? 'docente' : 'familia',
        especialidad: user.perfil_docentes?.especialidad || '',
        direccion: user.perfil_familias?.direccion || '',
      };
    });
  }

  async createUser(data: any) {
    const { cedula, email, password_raw, rol, nombre, apellido, telefono, extraField } = data;

    if (!validarCedulaEcuatoriana(cedula)) {
      throw new BadRequestException('La cédula ingresada no es una cédula ecuatoriana válida.');
    }

    const existing = await this.prisma.usuarios.findFirst({
      where: { OR: [{ email }, { cedula }] },
    });
    if (existing) {
      throw new BadRequestException('El correo electrónico o la cédula ya están registrados en el sistema.');
    }

    const password_hash = await bcrypt.hash(password_raw, 10);
    const rol_id = rol === 'admin' ? 1 : rol === 'docente' ? 2 : 3;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuarios.create({
        data: {
          cedula,
          email,
          password_hash,
          rol_id,
          nombre,
          apellido,
          telefono: telefono || null,
          activo: true,
        },
      });

      if (rol === 'docente') {
        await tx.perfil_docentes.create({
          data: {
            usuario_id: user.id,
            especialidad: extraField || 'Desarrollo Cognitivo Infantil',
          },
        });
      } else if (rol === 'familia') {
        await tx.perfil_familias.create({
          data: {
            usuario_id: user.id,
            direccion: extraField || '',
          },
        });
      }

      return user;
    });
  }

  async updateUser(id: string, data: any) {
    const { cedula, email, password_raw, rol, nombre, apellido, telefono, extraField, activo } = data;

    if (!validarCedulaEcuatoriana(cedula)) {
      throw new BadRequestException('La cédula ingresada no es una cédula ecuatoriana válida.');
    }

    const existing = await this.prisma.usuarios.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ email }, { cedula }] },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('El correo electrónico o la cédula ya se encuentran registrados por otro usuario.');
    }

    const oldUser = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!oldUser) {
      throw new BadRequestException('El usuario especificado no existe.');
    }

    const targetRolId = rol === 'admin' ? 1 : rol === 'docente' ? 2 : 3;

    return this.prisma.$transaction(async (tx) => {
      if (oldUser.rol_id !== targetRolId) {
        if (oldUser.rol_id === 2) {
          await tx.perfil_docentes.deleteMany({ where: { usuario_id: id } });
        } else if (oldUser.rol_id === 3) {
          await tx.perfil_familias.deleteMany({ where: { usuario_id: id } });
        }

        if (targetRolId === 2) {
          await tx.perfil_docentes.create({
            data: {
              usuario_id: id,
              especialidad: extraField || 'Desarrollo Cognitivo Infantil',
            },
          });
        } else if (targetRolId === 3) {
          await tx.perfil_familias.create({
            data: {
              usuario_id: id,
              direccion: extraField || '',
            },
          });
        }
      } else {
        if (targetRolId === 2) {
          await tx.perfil_docentes.upsert({
            where: { usuario_id: id },
            create: { usuario_id: id, especialidad: extraField || 'Desarrollo Cognitivo Infantil' },
            update: { especialidad: extraField || 'Desarrollo Cognitivo Infantil' },
          });
        } else if (targetRolId === 3) {
          await tx.perfil_familias.upsert({
            where: { usuario_id: id },
            create: { usuario_id: id, direccion: extraField || '' },
            update: { direccion: extraField || '' },
          });
        }
      }

      const updateData: any = {
        cedula,
        email,
        nombre,
        apellido,
        telefono: telefono || null,
        activo: activo !== undefined ? (activo === true || activo === 'true') : true,
        rol_id: targetRolId,
      };

      if (password_raw) {
        updateData.password_hash = await bcrypt.hash(password_raw, 10);
      }

      const updated = await tx.usuarios.update({
        where: { id },
        data: updateData,
      });

      const { password_hash, ...u } = updated;
      return u;
    });
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.usuarios.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(
        'No se pudo eliminar el usuario debido a que tiene registros vinculados (grupos, evaluaciones, estudiantes, etc.). Desactívelo en su lugar para revocar el acceso.',
      );
    }
  }

  async getTables() {
    return ALLOWED_TABLES;
  }

  async getTableRecords(tableName: string) {
    if (!ALLOWED_TABLES.includes(tableName)) {
      throw new BadRequestException(`La tabla "${tableName}" no está permitida o no existe.`);
    }

    const records = await (this.prisma[tableName] as any).findMany();
    return JSON.parse(
      JSON.stringify(records, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
    );
  }

  async updateTableRecord(tableName: string, id: string, data: any) {
    if (!ALLOWED_TABLES.includes(tableName)) {
      throw new BadRequestException(`La tabla "${tableName}" no está permitida o no existe.`);
    }

    const PRIMARY_KEYS: Record<string, string | string[]> = {
      configuraciones_sistema: 'clave',
      perfil_docentes: 'usuario_id',
      perfil_familias: 'usuario_id',
      familia_estudiante: ['familia_id', 'estudiante_id'],
    };

    const pk = PRIMARY_KEYS[tableName] || 'id';
    let where = {};

    if (Array.isArray(pk)) {
      const [famId, estId] = id.split('_');
      where = {
        familia_id_estudiante_id: {
          familia_id: famId,
          estudiante_id: estId,
        },
      };
    } else {
      const isNumber = pk === 'id' && (tableName === 'roles' || tableName === 'auditoria_logs');
      where = { [pk]: isNumber ? Number(id) : id };
    }

    const cleanData = { ...data };
    if (Array.isArray(pk)) {
      pk.forEach((k) => delete cleanData[k]);
    } else {
      delete cleanData[pk];
    }

    // Adaptar tipos
    for (const key of Object.keys(cleanData)) {
      const val = cleanData[key];
      if (val === '' || val === null) {
        cleanData[key] = null;
      } else if (
        key === 'activo' ||
        key === 'realizada' ||
        key === 'es_representante_principal' ||
        key === 'es_publicada_familia' ||
        key === 'activa' ||
        key === 'abandono'
      ) {
        cleanData[key] = val === true || val === 'true';
      } else if (
        key === 'rol_id' ||
        key === 'semanas_previstas' ||
        key === 'desempeno_hijo_percepcion' ||
        key === 'orden' ||
        key === 'peso_valor' ||
        key === 'version' ||
        key === 'numero_pregunta' ||
        key === 'intentos_por_elemento' ||
        key === 'nivel_completado' ||
        key === 'uso_ayudas'
      ) {
        cleanData[key] = Number(val);
      } else if (key === 'nota_docente' || key === 'tasa_acierto') {
        cleanData[key] = parseFloat(val);
      } else if (key === 'fecha_nacimiento') {
        cleanData[key] = new Date(val);
      } else if (
        key.startsWith('fecha_') ||
        key === 'fecha_evento' ||
        key === 'fecha_limite' ||
        key === 'fecha_realizacion' ||
        key === 'fecha_sesion' ||
        key === 'fecha_evaluacion' ||
        key === 'fecha_monitoreo' ||
        key === 'fecha_modificacion'
      ) {
        cleanData[key] = val ? new Date(val) : null;
      }
    }

    try {
      const updated = await (this.prisma[tableName] as any).update({
        where,
        data: cleanData,
      });
      return JSON.parse(
        JSON.stringify(updated, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
      );
    } catch (err) {
      throw new BadRequestException(`Error al actualizar registro: ${err.message}`);
    }
  }

  async deleteTableRecord(tableName: string, id: string) {
    if (!ALLOWED_TABLES.includes(tableName)) {
      throw new BadRequestException(`La tabla "${tableName}" no está permitida.`);
    }

    const PRIMARY_KEYS: Record<string, string | string[]> = {
      configuraciones_sistema: 'clave',
      perfil_docentes: 'usuario_id',
      perfil_familias: 'usuario_id',
      familia_estudiante: ['familia_id', 'estudiante_id'],
    };

    const pk = PRIMARY_KEYS[tableName] || 'id';
    let where = {};

    if (Array.isArray(pk)) {
      const [famId, estId] = id.split('_');
      where = {
        familia_id_estudiante_id: {
          familia_id: famId,
          estudiante_id: estId,
        },
      };
    } else {
      const isNumber = pk === 'id' && (tableName === 'roles' || tableName === 'auditoria_logs');
      where = { [pk]: isNumber ? Number(id) : id };
    }

    try {
      const deleted = await (this.prisma[tableName] as any).delete({ where });
      return JSON.parse(
        JSON.stringify(deleted, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
      );
    } catch (err) {
      throw new BadRequestException(
        'No se pudo eliminar el registro de la base de datos debido a que es referenciado por otros elementos (Restricción de Integridad).',
      );
    }
  }
}
