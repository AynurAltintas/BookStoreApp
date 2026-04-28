import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BooksService implements OnModuleInit {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  private getSeedFilePath() {
    return path.join(process.cwd(), 'data', 'books-seed.json');
  }

  private readSeedBooks(): Partial<Book>[] {
    const fileContent = fs.readFileSync(this.getSeedFilePath(), 'utf8');
    return JSON.parse(fileContent);
  }

  getSeedSalesTotal() {
    return this.readSeedBooks().reduce((total, book) => total + Number(book.salesCount || 0), 0);
  }

  async onModuleInit() {
    const count = await this.bookRepository.count();
    if (count === 0) {
      await this.resetDatabase();
    }
  }

  async resetDatabase() {
    try {
      await this.bookRepository.clear();

      const tableName = this.bookRepository.metadata.tableName;
      await this.bookRepository.query('DELETE FROM sqlite_sequence WHERE name = ?', [tableName]);

      const initialBooks = this.readSeedBooks();

      await this.bookRepository.save(initialBooks);

      console.log('Kitap veritabanı JSON dosyasından başarıyla sıfırlandı!');
      return { message: 'Veritabanı orijinal haline döndürüldü!' };
    } catch (error) {
      console.error('Kitaplar sıfırlanırken hata oluştu:', error);
      throw new Error('Kitap seed dosyası okunurken hata!');
    }
  }

  async update(id: number, updateData: Partial<Book>) {
    await this.bookRepository.update(id, updateData);
    return this.bookRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error('Kitap bulunamadı.');
    }
    await this.bookRepository.remove(book);
    return { message: 'Kitap başarıyla silindi.' };
  }

  async create(bookData: Partial<Book>) {
    const title = String(bookData.title ?? '').trim();
    const author = String(bookData.author ?? '').trim();
    const price = Number(bookData.price ?? 0);
    const stock = Number(bookData.stock ?? 0);
    const coverUrl = String(bookData.coverUrl ?? '').trim();

    if (!title || !author) {
      throw new Error('Kitap adı ve yazar zorunludur.');
    }

    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      throw new Error('Fiyat ve stok 0 veya daha büyük olmalıdır.');
    }

    const newBook = this.bookRepository.create({
      title,
      author,
      price,
      stock,
      salesCount: 0,
      coverUrl,
    });

    return this.bookRepository.save(newBook);
  }

  async purchase(id: number) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (book && book.stock > 0) {
      book.stock -= 1;
      book.salesCount += 1;
      return this.bookRepository.save(book);
    }
    throw new Error('Stok yetersiz!');
  }

  findAll() {
    return this.bookRepository.find();
  }
}