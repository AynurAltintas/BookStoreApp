import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  salesCount: number;
  stock: number;
  coverUrl: string;
}

interface User {
  id: number;
  email: string;
  role: string;
}

interface SeedSalesSummary {
  totalSales: number;
}

interface EditableBook {
  title: string;
  author: string;
  price: string;
  stock: string;
  coverUrl: string;
}

interface NewBookForm {
  title: string;
  author: string;
  price: string;
  stock: string;
  coverUrl: string;
}

interface MonthlySalesPoint {
  label: string;
  value: number;
  isCurrentMonth: boolean;
  isSimulated: boolean;
}

const MONTH_LABELS = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
});

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [draftBooks, setDraftBooks] = useState<Record<number, EditableBook>>({});
  const [savingBookId, setSavingBookId] = useState<number | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeletingUserId, setIsDeletingUserId] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [seedSalesTotal, setSeedSalesTotal] = useState<number>(0);
  const [newBook, setNewBook] = useState<NewBookForm>({
    title: '',
    author: '',
    price: '0',
    stock: '0',
    coverUrl: '',
  });

  const yearlySalesData = useMemo(() => {
    const now = new Date();
    const totalSales = books.reduce((total, book) => total + Number(book.salesCount || 0), 0);
    const totalRevenue = books.reduce(
      (total, book) => total + Number(book.price || 0) * Number(book.salesCount || 0),
      0,
    );
    const aprilGrowth = Math.max(totalSales - seedSalesTotal, 0);
    const seedBooks = books.filter((book) => Number(book.salesCount || 0) > 0);
    const seedBase = seedBooks.reduce((seed, book) => seed + book.id * (book.salesCount + book.title.length), 13);

    const monthEntries = Array.from({ length: 11 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const monthIndex = monthDate.getMonth();
      const yearShort = String(monthDate.getFullYear()).slice(-2);
      return {
        label: `${MONTH_LABELS[monthIndex]} ${yearShort}`,
        weight: seededRandom(seedBase + (index + 1) * 97 + monthDate.getFullYear()) + 0.2,
      };
    });

    const weightTotal = monthEntries.reduce((sum, entry) => sum + entry.weight, 0);
    const rawAllocations = monthEntries.map((entry) => (seedSalesTotal * entry.weight) / (weightTotal || 1));
    const baseAllocations = rawAllocations.map((value) => Math.floor(value));
    let remaining = seedSalesTotal - baseAllocations.reduce((sum, value) => sum + value, 0);

    const remainderOrder = rawAllocations
      .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
      .sort((left, right) => right.fraction - left.fraction);

    for (let i = 0; i < remainderOrder.length && remaining > 0; i += 1) {
      baseAllocations[remainderOrder[i].index] += 1;
      remaining -= 1;
    }

    const points: MonthlySalesPoint[] = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const monthIndex = monthDate.getMonth();
      const yearShort = String(monthDate.getFullYear()).slice(-2);
      const label = `${MONTH_LABELS[monthIndex]} ${yearShort}`;
      const isCurrentMonth = i === 11;

      if (isCurrentMonth) {
        return {
          label,
          value: aprilGrowth,
          isCurrentMonth: true,
          isSimulated: false,
        };
      }

      return {
        label: monthEntries[i].label,
        value: baseAllocations[i],
        isCurrentMonth: false,
        isSimulated: true,
      };
    });

    const maxValueRaw = Math.max(...points.map((point) => point.value), 1);
    const maxValue = Math.ceil(maxValueRaw / 10) * 10;
    const yearTotal = points.reduce((sum, point) => sum + point.value, 0);
    const yTicks = [maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0];
    const currentMonthLabel = points[11]?.label ?? '';

    return {
      points,
      maxValue,
      yearTotal,
      yearRevenue: totalRevenue,
      currentMonthSales: aprilGrowth,
      yTicks,
      currentMonthLabel,
    };
  }, [books, seedSalesTotal]);

  const createDrafts = (items: Book[]) => {
    const nextDrafts: Record<number, EditableBook> = {};
    items.forEach((book) => {
      nextDrafts[book.id] = {
        title: book.title,
        author: book.author,
        price: String(book.price),
        stock: String(book.stock),
        coverUrl: book.coverUrl ?? '',
      };
    });
    return nextDrafts;
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [booksResult, usersResult, seedSalesResult] = await Promise.allSettled([
        api.get('/books'),
        api.get('/auth/users'),
        api.get<SeedSalesSummary>('/books/seed-sales-total'),
      ]);

      if (booksResult.status === 'fulfilled') {
        setBooks(booksResult.value.data);
        setDraftBooks(createDrafts(booksResult.value.data));
      } else {
        console.error('Kitaplar yuklenirken hata:', booksResult.reason);
        toast.error('Kitaplar yüklenirken hata oluştu.');
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value.data);
      } else {
        console.error('Kullanicilar yuklenirken hata:', usersResult.reason);
        toast.error('Kullanıcılar yüklenirken hata oluştu.');
      }

      if (seedSalesResult.status === 'fulfilled') {
        setSeedSalesTotal(seedSalesResult.value.data.totalSales);
      } else {
        console.error('Seed satis toplami yuklenirken hata:', seedSalesResult.reason);
        toast.error('Grafik verisi hazırlanırken hata oluştu.');
      }

      if (booksResult.status === 'rejected' && usersResult.status === 'rejected' && seedSalesResult.status === 'rejected') {
        toast.error('Veriler yüklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Beklenmeyen veri yukleme hatasi:', error);
      toast.error('Veriler yüklenirken hata oluştu.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookFieldChange = (
    bookId: number,
    field: keyof EditableBook,
    value: string,
  ) => {
    setDraftBooks((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value,
      },
    }));
  };

  const handleSaveBook = async (bookId: number) => {
    const draft = draftBooks[bookId];
    if (!draft) {
      return;
    }

    const title = draft.title.trim();
    const author = draft.author.trim();
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    const coverUrl = draft.coverUrl.trim();

    if (!title || !author) {
      toast.error('Kitap adi ve yazar bos olamaz.');
      return;
    }

    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      toast.error('Fiyat ve stok 0 veya daha buyuk olmalidir.');
      return;
    }

    try {
      setSavingBookId(bookId);
      await api.put(`/books/${bookId}`, {
        title,
        author,
        price,
        stock,
        coverUrl,
      });
      toast.success('Kitap bilgisi guncellendi.');
      await fetchData();
    } catch (error) {
      toast.error('Kitap guncellenirken hata olustu.');
    } finally {
      setSavingBookId(null);
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('Tüm verileri sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        setIsResetting(true);
        await api.post('/reset-all');
        toast.success('Veriler başarıyla sıfırlandı.');
        await fetchData();
      } catch (error) {
        toast.error('Veriler sıfırlanırken hata oluştu.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleDeleteBook = async (bookId: number, title: string) => {
    if (window.confirm(`"${title}" kitabını silmek istediğinizden emin misiniz?`)) {
      try {
        setSavingBookId(bookId);
        await api.delete(`/books/${bookId}`);
        toast.success('Kitap başarıyla silindi.');
        await fetchData();
      } catch (error) {
        toast.error('Kitap silinirken hata oluştu.');
      } finally {
        setSavingBookId(null);
      }
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (window.confirm(`"${email}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
      try {
        setIsDeletingUserId(userId);
        await api.delete(`/auth/users/${userId}`);
        toast.success('Kullanıcı başarıyla silindi.');
        await fetchData();
      } catch (error) {
        toast.error('Kullanıcı silinirken hata oluştu.');
      } finally {
        setIsDeletingUserId(null);
      }
    }
  };

  const handleNewBookField = (field: keyof NewBookForm, value: string) => {
    setNewBook((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = newBook.title.trim();
    const author = newBook.author.trim();
    const price = Number(newBook.price);
    const stock = Number(newBook.stock);
    const coverUrl = newBook.coverUrl.trim();

    if (!title || !author) {
      toast.error('Yeni kitap için ad ve yazar zorunludur.');
      return;
    }

    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      toast.error('Yeni kitap fiyatı ve stoku 0 veya daha büyük olmalıdır.');
      return;
    }

    try {
      setIsAddingBook(true);
      await api.post('/books', {
        title,
        author,
        price,
        stock,
        coverUrl,
      });
      toast.success('Yeni kitap eklendi.');
      setNewBook({ title: '', author: '', price: '0', stock: '0', coverUrl: '' });
      await fetchData();
    } catch (error) {
      toast.error('Kitap eklenirken hata oluştu.');
    } finally {
      setIsAddingBook(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ padding: '18px' }}>
        <div className="admin-header">
          <div>
            <h1 className="title">Admin Kontrol Paneli</h1>
            <p className="subtitle">Kitap, stok ve kullanıcı verilerini buradan yönetebilirsiniz.</p>
          </div>
          <div className="actions">
            <button 
              onClick={handleResetAll} 
              disabled={isResetting}
              className="btn btn-danger"
            >
              {isResetting ? 'Sıfırlanıyor...' : 'Tüm Verileri Sıfırla'}
            </button>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <h2 className="table-title">Yeni Kitap Ekle</h2>
        <form className="new-book-form" onSubmit={handleCreateBook}>
          <input
            className="table-input"
            placeholder="Kitap adı"
            value={newBook.title}
            onChange={(e) => handleNewBookField('title', e.target.value)}
          />
          <input
            className="table-input"
            placeholder="Yazar"
            value={newBook.author}
            onChange={(e) => handleNewBookField('author', e.target.value)}
          />
          <input
            className="table-input table-input-number"
            type="number"
            min={0}
            placeholder="Fiyat"
            value={newBook.price}
            onChange={(e) => handleNewBookField('price', e.target.value)}
          />
          <input
            className="table-input table-input-number"
            type="number"
            min={0}
            placeholder="Stok"
            value={newBook.stock}
            onChange={(e) => handleNewBookField('stock', e.target.value)}
          />
          <input
            className="table-input"
            placeholder="Kapak URL"
            value={newBook.coverUrl}
            onChange={(e) => handleNewBookField('coverUrl', e.target.value)}
          />
          <button className="btn btn-success new-book-btn" type="submit" disabled={isAddingBook}>
            {isAddingBook ? 'Ekleniyor...' : 'Kitap Ekle'}
          </button>
        </form>
      </div>

      <div className="card table-card">
        <h2 className="table-title">Yillik Satis Grafigi</h2>
        <p className="sales-chart-note">
          Nisan ayi başlangıçta 0 görünür; sonradan yapılan satışlar Nisan çubuğunda artış olarak görünür.
        </p>
        <div className="sales-legend" aria-label="Grafik aciklamasi">
          <span className="legend-item"><span className="legend-dot legend-dot-current" />Bu ay (gercek)</span>
          <span className="legend-item"><span className="legend-dot legend-dot-simulated" />Onceki aylar (simule)</span>
        </div>
        <div className="sales-chart-shell" aria-label="Yillik kitap satis grafigi">
          <div className="sales-y-axis">
            {yearlySalesData.yTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="sales-chart-wrap">
            {yearlySalesData.points.map((point) => {
              const heightPercent = (point.value / yearlySalesData.maxValue) * 100;
              return (
                <div key={point.label} className="sales-bar-group">
                  <div className="sales-bar-track">
                    <div
                      className={`sales-bar ${point.isCurrentMonth ? 'sales-bar-current' : ''} ${point.isSimulated ? 'sales-bar-simulated' : ''}`}
                      style={{ height: `${Math.max(heightPercent, point.value > 0 ? 6 : 0)}%` }}
                      title={`${point.label}: ${point.value}`}
                    />
                  </div>
                  <span className="sales-bar-value">{point.value}</span>
                  <span className="sales-bar-label">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sales-summary">
          <span>Yillik toplam: {yearlySalesData.yearTotal}</span>
          <span>Yillik gelir: {currencyFormatter.format(yearlySalesData.yearRevenue)}</span>
          <span>{yearlySalesData.currentMonthLabel}: {yearlySalesData.currentMonthSales}</span>
        </div>
        {isLoadingData ? <p className="sales-chart-loading">Grafik verileri yükleniyor...</p> : null}
      </div>

      <div className="card table-card">
        <h2 className="table-title">Kitap Envanteri</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kitap Adı</th>
              <th>Yazar</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>Kapak URL</th>
              <th>Satış</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>
                  <input
                    className="table-input"
                    value={draftBooks[book.id]?.title ?? ''}
                    onChange={(e) => handleBookFieldChange(book.id, 'title', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    value={draftBooks[book.id]?.author ?? ''}
                    onChange={(e) => handleBookFieldChange(book.id, 'author', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input table-input-number"
                    type="number"
                    min={0}
                    value={draftBooks[book.id]?.price ?? ''}
                    onChange={(e) => handleBookFieldChange(book.id, 'price', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input table-input-number"
                    type="number"
                    min={0}
                    value={draftBooks[book.id]?.stock ?? ''}
                    onChange={(e) => handleBookFieldChange(book.id, 'stock', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    value={draftBooks[book.id]?.coverUrl ?? ''}
                    onChange={(e) => handleBookFieldChange(book.id, 'coverUrl', e.target.value)}
                  />
                </td>
                <td>{book.salesCount}</td>
                <td>
                  <button
                    className="btn btn-primary table-action-btn"
                    onClick={() => handleSaveBook(book.id)}
                    disabled={savingBookId === book.id}
                  >
                    {savingBookId === book.id ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    className="btn btn-danger table-action-btn"
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    disabled={savingBookId === book.id}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-card">
        <h2 className="table-title">Kayıtlı Kullanıcılar</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>E-posta</th>
              <th>Yetki</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td className={user.role === 'admin' ? 'role-admin' : ''}>{user.role}</td>
                <td>
                  <button
                    className="btn btn-danger table-action-btn"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    disabled={isDeletingUserId === user.id}
                  >
                    {isDeletingUserId === user.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;