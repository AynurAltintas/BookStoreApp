import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bookstore.sqlite', // Proje dizininde oluşacak dosya
      autoLoadEntities: true, // Entity'leri otomatik yükler
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Geliştirme aşamasında tabloları otomatik oluşturur
    }),
    BooksModule,
    AuthModule,
    // Birazdan buraya Auth ve Books modüllerini ekleyeceğiz
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}