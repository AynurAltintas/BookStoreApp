import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book])
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, TypeOrmModule]
})
export class BooksModule {}