import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { FamiliasService } from './familias.service';

@Controller('api')
export class FamiliasController {
  constructor(private readonly familiasService: FamiliasService) {}

  @Get('familias/buscar/:cedula')
  async findFamiliaByCedula(@Param('cedula') cedula: string) {
    return this.familiasService.findFamiliaByCedula(cedula);
  }

  @Post('familias')
  async createFamilia(@Body() body: { cedula?: string; email: string; nombre: string; apellido: string; telefono?: string }) {
    return this.familiasService.createFamilia(body);
  }

  @Get('familia/hijos')
  async getHijos(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000002';
    return this.familiasService.getHijosByFamilia(activeUserId);
  }

  @Get('estudiantes/:id/actividades-casa')
  async getActividadesCasa(@Param('id') estudianteId: string) {
    return this.familiasService.getActividadesCasaByEstudiante(estudianteId);
  }

  @Post('estudiantes/:id/actividades-casa/seguimiento')
  async saveActividadCasaSeguimiento(
    @Param('id') estudianteId: string,
    @Body() body: { actividad_id: string; realizada?: boolean; comentario_familia?: string; nota?: string }
  ) {
    return this.familiasService.saveActividadCasaSeguimiento({
      estudiante_id: estudianteId,
      actividad_id: body.actividad_id,
      realizada: body.realizada,
      comentario_familia: body.comentario_familia,
      nota: body.nota,
    });
  }
}
