import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    create(@Body() createData: any) {
        return this.booksService.create(createData);
    }
    
    @Get() // Frontend buraya istek atıyor
    findAll() {
        return this.booksService.findAll();
    }

    @Get('seed-sales-total')
    getSeedSalesTotal() {
        return { totalSales: this.booksService.getSeedSalesTotal() };
    }

    @Put(':id') // Frontend buraya istek 
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.booksService.update(+id, updateData);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.booksService.delete(+id);
    }

    @Post(':id/purchase')
    purchase(@Param('id') id: string) {
        return this.booksService.purchase(+id);
    }

    @Post('reset')
    reset() {
        return this.booksService.resetDatabase();
    }
}