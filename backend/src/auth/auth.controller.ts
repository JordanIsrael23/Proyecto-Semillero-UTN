import { Controller, Post, Put, Body, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { cedulaOrEmail: string; password_raw: string }) {
    return this.authService.login(body.cedulaOrEmail, body.password_raw);
  }

  @Post('register')
  async register(
    @Body() body: {
      cedula: string;
      email: string;
      password_raw: string;
      rol: 'docente' | 'familia';
      nombre: string;
      apellido: string;
      telefono?: string;
    }
  ) {
    return this.authService.register(body);
  }

  @Put('perfil')
  async updateProfile(
    @Headers('x-user-id') userId: string,
    @Body() body: any
  ) {
    if (!userId) {
      throw new UnauthorizedException('Falta cabecera x-user-id');
    }
    return this.authService.updateProfile(userId, body);
  }
}
