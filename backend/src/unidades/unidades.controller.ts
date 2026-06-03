import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { estado_unidad, tipo_actividad } from '@prisma/client';

@Controller('api')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Get('docente/unidades')
  async getUnidades(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.unidadesService.getUnidadesByDocente(activeUserId);
  }

  @Post('unidades')
  async createUnidad(
    @Headers('x-user-id') userId: string,
    @Body() body: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.unidadesService.createUnidad(activeUserId, body);
  }

  @Put('unidades/:id')
  async updateUnidad(
    @Param('id') id: string,
    @Body() body: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }
  ) {
    return this.unidadesService.updateUnidad(id, body);
  }

  @Post('unidades/:id/clonar')
  async cloneUnidad(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.unidadesService.cloneUnidad(id, activeUserId);
  }

  @Post('unidades/:id/actividades')
  async createActividad(@Param('id') unidadId: string, @Body() body: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.unidadesService.createActividad(unidadId, body);
  }

  @Put('actividades/:id')
  async updateActividad(@Param('id') id: string, @Body() body: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.unidadesService.updateActividad(id, body);
  }

  @Delete('actividades/:id')
  async deleteActividad(@Param('id') id: string) {
    return this.unidadesService.deleteActividad(id);
  }
}
