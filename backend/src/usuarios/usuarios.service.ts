import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.usuarios.findMany({
      include: {
        docentes: true,
        familias: true,
      },
      orderBy: { email: 'asc' },
    });
  }
}
