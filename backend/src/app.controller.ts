import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { BooksService } from './books/books.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly booksService: BooksService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('reset-all')
  async resetAll() {
    await this.authService.resetUsers();
    await this.booksService.resetDatabase();
    return { message: 'Tüm veriler başarıyla sıfırlandı.' };
  }
}
