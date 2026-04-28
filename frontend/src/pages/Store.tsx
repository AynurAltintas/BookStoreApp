import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverUrl: string;
};

type CartItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
};

const Store = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchBooks = async () => {
    const res = await api.get('/books');
    setBooks(res.data);
  };

  useEffect(() => { fetchBooks(); }, []);

  const getBookStock = (bookId: number) => {
    const book = books.find((b) => b.id === bookId);
    return book?.stock ?? 0;
  };

  const notifyCartAdded = (title: string) => {
    toast.success(`${title} sepete eklendi`, {
      icon: '✓',
    });
  };

  const addToCart = (book: Book) => {
    const existing = cart.find((item) => item.bookId === book.id);
    if (!existing) {
      setCart((prev) => [...prev, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }]);
      notifyCartAdded(book.title);
      return;
    }

    const stock = getBookStock(book.id);
    if (existing.quantity >= stock) {
      toast.error('Sepetteki adet stoktan fazla olamaz.');
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
    notifyCartAdded(book.title);
  };

  const increaseQuantity = (bookId: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.bookId !== bookId) {
          return item;
        }

        const stock = getBookStock(bookId);
        if (item.quantity >= stock) {
          toast.error('Sepetteki adet stoktan fazla olamaz.');
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      }),
    );
  };

  const decreaseQuantity = (bookId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.bookId === bookId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const validateCartStock = async () => {
    const res = await api.get('/books');
    const latestBooks: Book[] = res.data;
    setBooks(latestBooks);

    const invalidItem = cart.find((item) => {
      const current = latestBooks.find((book) => book.id === item.bookId);
      return !current || current.stock < item.quantity;
    });

    if (!invalidItem) {
      return true;
    }

    toast.error(`${invalidItem.title} icin stok yetersiz.`);
    return false;
  };

  const checkoutCart = async () => {
    if (cart.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const isCartValid = await validateCartStock();
      if (!isCartValid) {
        return;
      }

      for (const item of cart) {
        for (let i = 0; i < item.quantity; i += 1) {
          await api.post(`/books/${item.bookId}/purchase`);
        }
      }

      toast.success('Sepetiniz başarıyla satın alındı!');
      setCart([]);
      await fetchBooks();
    } catch (error) {
      toast.error('Satin alma tamamlanamadi. Stok degismis olabilir, lutfen tekrar deneyin.');
      await fetchBooks();
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ padding: '18px' }}>
        <h1 className="title">Kitap Mağazası</h1>
        <p className="subtitle">Kitapları sepete ekleyip tek adımda satın alabilirsiniz.</p>
      </div>

      <div className="store-layout">
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="card book-card">
              <img
                className="book-cover"
                src={book.coverUrl || `https://placehold.co/300x450/png?text=${encodeURIComponent(book.title)}`}
                alt={`${book.title} kapagi`}
              />
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p className="book-price">{book.price} TL</p>
              <button
                onClick={() => addToCart(book)}
                disabled={book.stock === 0}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Sepete Ekle
              </button>
            </div>
          ))}
        </div>

        <div className="card cart-panel">
          <h2 className="table-title">Sepet</h2>
          <p>Toplam Ürün: {cartCount}</p>
          {cart.length === 0 && <p>Sepetiniz boş.</p>}

          {cart.map((item) => (
            <div key={item.bookId} className="cart-item">
              <strong>{item.title}</strong>
              <p style={{ margin: '6px 0' }}>{item.price} TL x {item.quantity}</p>
              <div className="qty-actions">
                <button onClick={() => decreaseQuantity(item.bookId)} className="btn btn-soft">-</button>
                <button onClick={() => increaseQuantity(item.bookId)} className="btn btn-soft">+</button>
                <button onClick={() => removeFromCart(item.bookId)} className="btn btn-danger">Sil</button>
              </div>
            </div>
          ))}

          <hr style={{ borderColor: 'var(--border)', marginTop: '14px' }} />
          <p style={{ fontWeight: 'bold' }}>Toplam: {cartTotal} TL</p>
          <button
            onClick={checkoutCart}
            disabled={cart.length === 0 || isCheckingOut}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            {isCheckingOut ? 'Satın Alınıyor...' : 'Sepeti Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;