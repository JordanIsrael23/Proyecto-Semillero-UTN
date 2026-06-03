import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';

@Controller('api')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Get('rubrica/criterios')
  async getCriterios() {
    return this.evaluacionesService.getCriterios();
  }

  @Get('rubrica/niveles')
  async getNiveles() {
    return this.evaluacionesService.getNivelesLogro();
  }

  @Post('evaluaciones')
  async registerEvaluacion(
    @Headers('x-user-id') userId: string,
    @Body() body: { estudiante_id: string; criterio_id: string; nivel_logro_id: string; unidad_didactica_id: string; observaciones?: string }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.evaluacionesService.registerEvaluacion(activeUserId, body);
  }
}
