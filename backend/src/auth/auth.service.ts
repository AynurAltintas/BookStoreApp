import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Giriş Yapma
  async login(email: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user?.password !== pass) {
      throw new UnauthorizedException('E-posta veya şifre hatalı!');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      role: user.role,
    };
  }

  // Yeni Kullanıcı Kaydı
  async register(email: string, pass: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda!');
    }

    const newUser = this.userRepository.create({
      email,
      password: pass,
      role: 'user'
    });

    await this.userRepository.save(newUser);
    return { message: 'Başarıyla kayıt oldunuz!' };
  }

  // Kullanıcı Veritabanını JSON Dosyasından Sıfırlama
  async resetUsers() {
    try {
      // 1. Tabloyu tamamen temizle
      await this.userRepository.clear();

      // 2. SQLite sequence sayacını sıfırla
      const tableName = this.userRepository.metadata.tableName;
      await this.userRepository.query('DELETE FROM sqlite_sequence WHERE name = ?', [tableName]);

      // 3. Seed dosyasını oku
      const filePath = path.join(process.cwd(), 'data', 'users-seed.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const seedUsers = JSON.parse(fileContent);

      // 4. Kullanıcıları tekrar ekle
      await this.userRepository.save(seedUsers);

      console.log('Kullanıcı veritabanı ve ID sayacı sıfırlandı!');
      return { message: 'Kullanıcılar sıfırlandı ve ID değerleri baştan başladı.' };
    } catch (error) {
      console.error('Sıfırlama sırasında hata:', error);
      throw new Error('Sıfırlama başarısız.');
    }
  }

  // Uygulama ilk açıldığında çalışacak admin kontrolü
  async createInitialAdmin() {
    const adminExists = await this.userRepository.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      // Eğer veritabanı boşsa resetUsers() fonksiyonunu çağırarak JSON'dan doldurabiliriz
      await this.resetUsers();
    }
  }

  // Tüm Kullanıcıları Listeleme (Admin Paneli İçin)
  async findAllUsers() {
    return this.userRepository.find();
  }

  // Belirli Bir Kullanıcıyı Silme
  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }
    await this.userRepository.remove(user);
    return { message: 'Kullanıcı başarıyla silindi.' };
  }
}