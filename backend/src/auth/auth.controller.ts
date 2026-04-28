import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // Frontend'den gelen email ve password'ü alıp service'e gönderiyoruz
    return this.authService.login(body.email, body.password);
  }
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.email, body.password);
 }

  // Eğer istersen manuel admin oluşturmak için bir endpoint (opsiyonel)
  @Post('setup')
  async setup() {
    await this.authService.createInitialAdmin();
    return { message: 'Admin kurulumu tetiklendi.' };
  }
  @Get('users')
async findAll() {
  return this.authService.findAllUsers();
}

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(+id);
  }
  
  // auth.controller.ts
@Post('reset')
async reset() {
  return this.authService.resetUsers();
}
}