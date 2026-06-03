import { Module } from '@nestjs/common';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoService } from './monitoreo.service';

@Module({
  controllers: [MonitoreoController],
  providers: [MonitoreoService],
})
export class MonitoreoModule {}
