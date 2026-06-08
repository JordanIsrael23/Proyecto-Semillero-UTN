import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GruposModule } from './grupos/grupos.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { FamiliasModule } from './familias/familias.module';
import { UnidadesModule } from './unidades/unidades.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';
import { AutoevaluacionesModule } from './autoevaluaciones/autoevaluaciones.module';
import { JuegosModule } from './Juegos/juegos.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    GruposModule,
    EstudiantesModule,
    FamiliasModule,
    UnidadesModule,
    EvaluacionesModule,
    MonitoreoModule,
    AutoevaluacionesModule,
    JuegosModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
