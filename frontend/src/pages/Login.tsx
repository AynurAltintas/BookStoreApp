import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/store');
      }
    } catch (error) {
      toast.error('Giriş başarısız! E-posta veya şifreyi kontrol edin.');
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleLogin} className="card auth-card">
        <h2 className="title">Kitap Mağazası Giriş</h2>
        <p className="subtitle">Hesabınıza giriş yaparak alışverişe başlayın.</p>
        <div className="auth-form">
          <input className="input" type="email" placeholder="E-posta" onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Giriş Yap</button>
        </div>
        <p className="auth-footer">
          Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;