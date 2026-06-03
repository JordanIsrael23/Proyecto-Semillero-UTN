import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { GruposService } from './grupos.service';

@Controller('api')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Get('docente/grupos')
  async getGrupos(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.gruposService.getGruposByDocente(activeUserId);
  }

  @Post('grupos')
  async createGrupo(
    @Headers('x-user-id') userId: string,
    @Body() body: { nombre: string }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.gruposService.createGroup(body.nombre, activeUserId);
  }

  @Get('grupos/:id/estudiantes')
  async getEstudiantes(@Param('id') grupoId: string) {
    return this.gruposService.getEstudiantesByGrupo(grupoId);
  }

  @Get('grupos/:id/consolidado')
  async getConsolidado(@Param('id') grupoId: string) {
    return this.gruposService.getConsolidadoGrupo(grupoId);
  }
}
