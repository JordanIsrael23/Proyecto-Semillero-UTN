import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';

@Controller('api')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Get('estudiantes/buscar/:cedula')
  async findEstudianteByCedula(@Param('cedula') cedula: string) {
    return this.estudiantesService.findEstudianteByCedula(cedula);
  }

  @Post('estudiantes')
  async createEstudiante(
    @Body() body: {
      cedula: string;
      nombre: string;
      apellido: string;
      grupo_id: string;
      fecha_nacimiento: string;
      representante_id?: string;
      parentesco?: string;
    }
  ) {
    return this.estudiantesService.createEstudiante(body);
  }

  @Put('estudiantes/:id')
  async updateEstudiante(
    @Param('id') id: string,
    @Body() body: { nombre: string; apellido: string; grupo_id: string; fecha_nacimiento: string; activo?: boolean }
  ) {
    return this.estudiantesService.updateEstudiante(id, body);
  }

  @Delete('estudiantes/:id')
  async deleteEstudiante(@Param('id') id: string) {
    return this.estudiantesService.deleteEstudiante(id);
  }

  @Get('estudiantes/:id/evaluaciones')
  async getHistorial(@Param('id') estudianteId: string) {
    return this.estudiantesService.getHistorialEstudiante(estudianteId);
  }

  @Get('estudiantes/:id/informe-completo')
  async getInformeCompleto(@Param('id') estudianteId: string) {
    return this.estudiantesService.getInformeCompletoEstudiante(estudianteId);
  }
}
