import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';

@Controller('api')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

  @Get('estudiantes/:id/ficha-monitoreo')
  async getFicha(@Param('id') estudianteId: string) {
    return this.monitoreoService.getFichaMonitoreo(estudianteId);
  }

  @Post('estudiantes/:id/ficha-monitoreo')
  async saveFicha(
    @Headers('x-user-id') userId: string,
    @Param('id') estudianteId: string,
    @Body() body: { clasificacion: string; seriacion: string; asimilacion_acomodacion: string; justificacion_logica: string; autorregulacion: string; observaciones?: string; acciones_apoyo?: string }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.monitoreoService.saveFichaMonitoreo(activeUserId, estudianteId, body);
  }
}
