# CENG302 Kitap Mağazası (Bookstore) Projesi

## Aynur Altıntaş 23253053

## Ödevin Amacı

Bu ödevin amacı, kullanıcı ve kitap verilerini yönetebilen, sepet ve yönetici işlemleri sunan bir kitap satış sistemi geliştirmektir. Sistem gerektiğinde tek komutla resetlenebilir, böylece veriler başlangıç durumuna döndürülür.

## Kurulum

### Adımlar

```bash
# Backend bağımlılıklarını yükle
cd backend
npm install

# Frontend bağımlılıklarını yükle
cd ../frontend
npm install
```

## Uygulamayı Çalıştırma

**Terminal 1 - Backend (Port 3000):**

```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend (Port 5173):**

```bash
cd frontend
npm run dev
```

Tarayıcıda açın: `http://localhost:5173`

## Varsayılan Kimlik Bilgileri

| Email                  | Şifre | Rol       |
| ---------------------- | ----- | --------- |
| admin@kitap.com        | 123   | Admin     |
| ahmet.yilmaz@gmail.com | 1234  | Kullanıcı |
| ayse.demir@gmail.com   | 1234  | Kullanıcı |
| elif.arslan@gmail.com  | 1234  | Kullanıcı |

## Özellikler

- ✓ Kullanıcı kaydı ve giriş (JWT)
- ✓ Alışveriş sepeti ve sipariş yönetimi
- ✓ Kitap kapak resimleri
- ✓ Yönetici Paneli (CRUD işlemleri)
- ✓ Yıllık satış analitikleri
- ✓ Gerçek zamanlı stok doğrulaması
- ✓ Toast bildirimleri
- ✓ Duyarlı tasarım (Mobile-friendly)

## API Endpoints

| Metod | Endpoint         | Açıklama               |
| ----- | ---------------- | ---------------------- |
| POST  | `/auth/login`    | Kullanıcı girişi       |
| POST  | `/auth/register` | Yeni kullanıcı oluştur |
| GET   | `/books`         | Tüm kitapları listele  |
| POST  | `/reset-all`     | Tüm verileri sıfırla   |

## Resetleme Nasıl Çalışır?

`/reset-all` endpoint'i çağrıldığında sistemdeki kullanıcı ve kitap verileri seed dosyalarından yeniden yüklenir. Böylece eklenen kayıtlar silinir, veritabanı başlangıç durumuna döner ve kimlik numaraları da sıfırlanır.

## Teknolojiler

- **Backend:** NestJS, TypeORM, SQLite
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** CSS Variables, Responsive Grid
- **State:** React Context, React Router v7
- **Notifications:** react-hot-toast

---
