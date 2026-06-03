import { Module } from '@nestjs/common';
import { AutoevaluacionesController } from './autoevaluaciones.controller';
import { AutoevaluacionesService } from './autoevaluaciones.service';

@Module({
  controllers: [AutoevaluacionesController],
  providers: [AutoevaluacionesService],
})
export class AutoevaluacionesModule {}
