import {
  Controller, Post, Body, Param, UseGuards,
  UnauthorizedException, ForbiddenException,
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JuegosService } from './juegos.service';
import type { IniciarSesionPayload, RegistrarDetallesPayload } from './juegos.service';

const JWT_SECRET = process.env.JWT_SECRET || 'testSecretKey';

// ─── Guard para endpoints del docente (valida JWT de usuario) ───
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token JWT no proporcionado o inválido.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      // Verificar que sea un token de usuario (no de sesión de juego)
      if (payload.type === 'game_session') {
        throw new ForbiddenException('Se requiere un token de usuario docente para este endpoint.');
      }
      request.user = payload;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Token JWT inválido o expirado.');
    }

    return true;
  }
}

// ─── Guard para endpoints de la app de juego (valida sessionToken) ───
@Injectable()
export class GameSessionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Session token no proporcionado.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      // Verificar que sea un token de sesión de juego
      if (payload.type !== 'game_session') {
        throw new ForbiddenException('Se requiere un session token de juego para este endpoint.');
      }

      request.gameSession = payload;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Session token inválido o expirado.');
    }

    return true;
  }
}

// ─── Controller ───
@Controller('api/juegos')
export class JuegosController {
  constructor(private readonly juegosService: JuegosService) {}

  /**
   * POST /api/juegos/sesion
   * Crea una sesión de juego. Solo para docentes autenticados.
   * Retorna un sessionToken + contexto completo que el docente pasa a la app de juego.
   */
  @Post('sesion')
  @UseGuards(JwtAuthGuard)
  async iniciarSesion(@Body() payload: IniciarSesionPayload) {
    return this.juegosService.iniciarSesion(payload);
  }

  /**
   * POST /api/juegos/sesion/:metricaSesionId/detalles
   * La app de juego envía los resultados de la sesión.
   * Requiere el sessionToken generado al crear la sesión.
   */
  @Post('sesion/:metricaSesionId/detalles')
  @UseGuards(GameSessionGuard)
  async registrarDetalles(
    @Param('metricaSesionId') metricaSesionId: string,
    @Body() payload: RegistrarDetallesPayload,
  ) {
    return this.juegosService.registrarDetalles(metricaSesionId, payload);
  }
}
