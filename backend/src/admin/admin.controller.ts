import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización no provisto.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'testSecretKey',
      });
      if (payload.rol !== 'admin') {
        throw new UnauthorizedException('Acceso restringido únicamente a administradores.');
      }
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}

@Controller('api/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('usuarios')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Post('usuarios')
  async createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @Put('usuarios/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('usuarios/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('tables')
  async getTables() {
    return this.adminService.getTables();
  }

  @Get('tables/:tableName')
  async getTableRecords(@Param('tableName') tableName: string) {
    return this.adminService.getTableRecords(tableName);
  }

  @Put('tables/:tableName/:id')
  async updateTableRecord(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateTableRecord(tableName, id, body);
  }

  @Delete('tables/:tableName/:id')
  async deleteTableRecord(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteTableRecord(tableName, id);
  }
}
