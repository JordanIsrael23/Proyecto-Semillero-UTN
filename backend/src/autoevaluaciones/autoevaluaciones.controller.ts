import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { AutoevaluacionesService } from './autoevaluaciones.service';
import { respuesta_autoevaluacion } from '@prisma/client';

@Controller('api')
export class AutoevaluacionesController {
  constructor(private readonly autoevaluacionesService: AutoevaluacionesService) {}

  @Post('autoevaluaciones')
  async saveAutoevaluacion(
    @Headers('x-user-id') userId: string,
    @Body() body: { unidad_didactica_id?: string; reflexion?: string; respuestas: { numero_pregunta: number; respuesta: respuesta_autoevaluacion }[] }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.autoevaluacionesService.saveAutoevaluacion(activeUserId, body);
  }

  @Get('unidades/:id/autoevaluaciones')
  async getAutoevaluaciones(@Param('id') unidadId: string) {
    return this.autoevaluacionesService.getAutoevaluacionesByUnidad(unidadId);
  }
}
