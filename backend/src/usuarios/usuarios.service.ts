import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.usuarios.findMany({
      include: {
        perfil_docentes: true,
        perfil_familias: true,
      },
      orderBy: { email: 'asc' },
    });

    return users.map((u) => {
      const rolName = u.rol_id === 1 ? 'admin' : u.rol_id === 2 ? 'docente' : 'familia';
      
      let docentes: any = null;
      if (u.perfil_docentes) {
        docentes = {
          id: u.perfil_docentes.usuario_id,
          usuario_id: u.perfil_docentes.usuario_id,
          nombre: u.nombre,
          apellido: u.apellido,
          telefono: u.telefono,
          especialidad: u.perfil_docentes.especialidad,
        };
      }

      let familias: any = null;
      if (u.perfil_familias) {
        familias = {
          id: u.perfil_familias.usuario_id,
          usuario_id: u.perfil_familias.usuario_id,
          nombre: u.nombre,
          apellido: u.apellido,
          telefono: u.telefono,
          direccion: u.perfil_familias.direccion,
        };
      }

      return {
        id: u.id,
        cedula: u.cedula,
        email: u.email,
        activo: u.activo,
        rol: rolName,
        fecha_creacion: u.fecha_creacion,
        fecha_actualizacion: u.fecha_actualizacion,
        docentes,
        familias,
      };
    });
  }
}
