import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();
  
  await app.listen(3000);
  console.log('Backend 3000 portunda çalışıyor...');
}
bootstrap();