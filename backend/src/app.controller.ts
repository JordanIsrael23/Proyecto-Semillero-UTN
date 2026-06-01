import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Headers, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { estado_unidad, tipo_actividad, respuesta_autoevaluacion } from '@prisma/client';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --------------------------------------------------------------------------
  // 1. GENERAL & SIMULADOR DE USUARIOS
  // --------------------------------------------------------------------------
  @Get('usuarios-demo')
  async getDemoUsers() {
    return this.appService.getUsers();
  }

  // --------------------------------------------------------------------------
  // 2. MÓDULO DOCENTE: GRUPOS Y ESTUDIANTES (RF-D01)
  // --------------------------------------------------------------------------
  @Get('docente/grupos')
  async getGrupos(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.getGruposByDocente(activeUserId);
  }

  @Get('grupos/:id/estudiantes')
  async getEstudiantes(@Param('id') grupoId: string) {
    return this.appService.getEstudiantesByGrupo(grupoId);
  }

  @Get('estudiantes/buscar/:cedula')
  async findEstudianteByCedula(@Param('cedula') cedula: string) {
    return this.appService.findEstudianteByCedula(cedula);
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
    return this.appService.createEstudiante(body);
  }

  @Put('estudiantes/:id')
  async updateEstudiante(@Param('id') id: string, @Body() body: { nombre: string; apellido: string; grupo_id: string; fecha_nacimiento: string; activo?: boolean }) {
    return this.appService.updateEstudiante(id, body);
  }

  @Delete('estudiantes/:id')
  async deleteEstudiante(@Param('id') id: string) {
    return this.appService.deleteEstudiante(id);
  }

  @Get('familias/buscar/:cedula')
  async findFamiliaByCedula(@Param('cedula') cedula: string) {
    return this.appService.findFamiliaByCedula(cedula);
  }

  @Post('familias')
  async createFamilia(@Body() body: { cedula?: string; email: string; nombre: string; apellido: string; telefono?: string }) {
    return this.appService.createFamilia(body);
  }

  // --------------------------------------------------------------------------
  // 3. MÓDULO DOCENTE: PLANIFICACIÓN PEDAGÓGICA (RF-D02)
  // --------------------------------------------------------------------------
  @Get('docente/unidades')
  async getUnidades(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.getUnidadesByDocente(activeUserId);
  }

  @Post('unidades')
  async createUnidad(
    @Headers('x-user-id') userId: string,
    @Body() body: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.createUnidad(activeUserId, body);
  }

  @Put('unidades/:id')
  async updateUnidad(
    @Param('id') id: string,
    @Body() body: { titulo: string; resumen?: string; ambito: string; objetivos_generales?: string; objetivos_aprendizaje?: string; destrezas?: string; semanas_previstas: number; estado?: estado_unidad }
  ) {
    return this.appService.updateUnidad(id, body);
  }

  @Post('unidades/:id/clonar')
  async cloneUnidad(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.cloneUnidad(id, activeUserId);
  }

  @Post('unidades/:id/actividades')
  async createActividad(@Param('id') unidadId: string, @Body() body: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.appService.createActividad(unidadId, body);
  }

  @Put('actividades/:id')
  async updateActividad(@Param('id') id: string, @Body() body: { titulo: string; descripcion: string; tipo: tipo_actividad; recursos_enlaces?: any }) {
    return this.appService.updateActividad(id, body);
  }

  @Delete('actividades/:id')
  async deleteActividad(@Param('id') id: string) {
    return this.appService.deleteActividad(id);
  }

  // --------------------------------------------------------------------------
  // 4. RÚBRICA Y REGISTRO DE EVALUACIONES (RF-D03, RF-D04, RF-D05, RF-F02, RF-F03)
  // --------------------------------------------------------------------------
  @Get('rubrica/criterios')
  async getCriterios() {
    return this.appService.getCriterios();
  }

  @Get('rubrica/niveles')
  async getNiveles() {
    return this.appService.getNivelesLogro();
  }

  @Post('evaluaciones')
  async registerEvaluacion(
    @Headers('x-user-id') userId: string,
    @Body() body: { estudiante_id: string; criterio_id: string; nivel_logro_id: string; unidad_didactica_id: string; observaciones?: string }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.registerEvaluacion(activeUserId, body);
  }

  @Get('estudiantes/:id/evaluaciones')
  async getHistorial(@Param('id') estudianteId: string) {
    return this.appService.getHistorialEstudiante(estudianteId);
  }

  @Get('grupos/:id/consolidado')
  async getConsolidado(@Param('id') grupoId: string) {
    return this.appService.getConsolidadoGrupo(grupoId);
  }

  // --------------------------------------------------------------------------
  // 5. FICHA DE MONITOREO INDIVIDUAL (RF-D06)
  // --------------------------------------------------------------------------
  @Get('estudiantes/:id/ficha-monitoreo')
  async getFicha(@Param('id') estudianteId: string) {
    return this.appService.getFichaMonitoreo(estudianteId);
  }

  @Post('estudiantes/:id/ficha-monitoreo')
  async saveFicha(
    @Headers('x-user-id') userId: string,
    @Param('id') estudianteId: string,
    @Body() body: { clasificacion: string; seriacion: string; asimilacion_acomodacion: string; justificacion_logica: string; autorregulacion: string; observaciones?: string; acciones_apoyo?: string }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.saveFichaMonitoreo(activeUserId, estudianteId, body);
  }

  // --------------------------------------------------------------------------
  // 6. AUTOEVALUACIÓN DOCENTE (RF-D07)
  // --------------------------------------------------------------------------
  @Post('autoevaluaciones')
  async saveAutoevaluacion(
    @Headers('x-user-id') userId: string,
    @Body() body: { unidad_didactica_id?: string; reflexion?: string; respuestas: { numero_pregunta: number; respuesta: respuesta_autoevaluacion }[] }
  ) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000001';
    return this.appService.saveAutoevaluacion(activeUserId, body);
  }

  @Get('unidades/:id/autoevaluaciones')
  async getAutoevaluaciones(@Param('id') unidadId: string) {
    return this.appService.getAutoevaluacionesByUnidad(unidadId);
  }

  // --------------------------------------------------------------------------
  // 7. MÓDULO FAMILIA Y TAREAS EN CASA (RF-F01, RF-F04)
  // --------------------------------------------------------------------------
  @Get('familia/hijos')
  async getHijos(@Headers('x-user-id') userId: string) {
    const activeUserId = userId || 'a0000000-0000-0000-0000-000000000002';
    return this.appService.getHijosByFamilia(activeUserId);
  }

  @Get('estudiantes/:id/actividades-casa')
  async getActividadesCasa(@Param('id') estudianteId: string) {
    return this.appService.getActividadesCasaByEstudiante(estudianteId);
  }

  @Post('estudiantes/:id/actividades-casa/seguimiento')
  async saveActividadCasaSeguimiento(
    @Param('id') estudianteId: string,
    @Body() body: { actividad_id: string; realizada: boolean; comentario_familia?: string }
  ) {
    return this.appService.saveActividadCasaSeguimiento({
      estudiante_id: estudianteId,
      actividad_id: body.actividad_id,
      realizada: body.realizada,
      comentario_familia: body.comentario_familia,
    });
  }

  // --------------------------------------------------------------------------
  // 8. INFORMES DESCARGABLES (RF-D10)
  // --------------------------------------------------------------------------
  @Get('estudiantes/:id/informe-completo')
  async getInformeCompleto(@Param('id') estudianteId: string) {
    return this.appService.getInformeCompletoEstudiante(estudianteId);
  }
}
