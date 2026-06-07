import { Module } from '@nestjs/common';
import { JuegosController } from './juegos.controller';
import { JuegosService } from './juegos.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Importado según la instrucción de utilizar la autenticación del módulo auth
  controllers: [JuegosController],
  providers: [JuegosService, PrismaService],
})
export class JuegosModule {}
