import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız!');
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleRegister} className="card auth-card">
        <h2 className="title">Yeni Hesap Oluştur</h2>
        <p className="subtitle">Saniyeler içinde kaydolup mağazayı kullanabilirsiniz.</p>
        <div className="auth-form">
          <input className="input" type="email" placeholder="E-posta" onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Kayıt Ol</button>
        </div>
        <p className="auth-footer">
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;