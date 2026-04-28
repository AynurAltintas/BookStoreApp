import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const userEmail = useMemo(() => {
    if (!token) {
      return '';
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded?.email ?? '';
    } catch {
      return '';
    }
  }, [token]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Cikis yapildi');
    navigate('/login');
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="navbar-wrap">
      <div className="navbar-inner">
        <button className="brand-btn" onClick={() => navigate(token ? '/store' : '/login')}>
          KitapMagaza
        </button>

        {token && (
          <div className="user-chip" title={userEmail || 'Kullanici'}>
            <span className="user-dot" />
            <span className="user-label">{userEmail || 'Giris yapmis kullanici'}</span>
            <span className={`role-pill ${role === 'admin' ? 'role-admin-pill' : 'role-user-pill'}`}>
              {role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
        )}

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Menuyu ac veya kapat"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? 'Kapat' : 'Menu'}
        </button>

        <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          {token && (
            <NavLink to="/store" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Mağaza
            </NavLink>
          )}

          {token && role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}

          {!token && (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Giris
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Kayit
              </NavLink>
            </>
          )}

          {token && (
            <button className="btn btn-soft nav-logout" onClick={handleLogout}>
              Çıkış
            </button>
          )}
        </nav>
      </div>

    </header>
  );
};

export default Navbar;
