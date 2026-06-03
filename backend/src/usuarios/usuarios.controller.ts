import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('api/usuarios-demo')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async getDemoUsers() {
    return this.usuariosService.getUsers();
  }
}
