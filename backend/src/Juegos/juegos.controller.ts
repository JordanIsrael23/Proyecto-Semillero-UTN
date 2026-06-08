import { Controller, Get, Post, Body, Param, UseGuards, UnauthorizedException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JuegosService } from './juegos.service';
import type { CreateMetricaPayload } from './juegos.service';

// Implementación básica de un Guard para JWT. 
// Deberá integrarse con la estrategia JWT real del proyecto en el futuro.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token JWT no proporcionado o inválido');
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'testSecretKey' });
      request.user = payload;
    } catch (err) {
      throw new UnauthorizedException('Token JWT inválido o expirado');
    }

    return true;
  }
}

@Controller('juegos')
@UseGuards(JwtAuthGuard)
export class JuegosController {
  constructor(private readonly juegosService: JuegosService) {}

  @Get('actividad/:idActividad/estudiante/:cedula')
  async obtenerActividad(
    @Param('idActividad') idActividad: string,
    @Param('cedula') cedula: string,
  ) {
    return this.juegosService.obtenerActividad(idActividad, cedula);
  }

  @Post('metricas')
  async registrarMetrica(@Body() createMetricaPayload: CreateMetricaPayload) {
    return this.juegosService.registrarMetrica(createMetricaPayload);
  }
}
