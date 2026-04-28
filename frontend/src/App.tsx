import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Store from './pages/Store';
import Register from './pages/Register';
import Navbar from './components/Navbar';


function App() {
  return (
    <Router>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2200,
          success: {
            duration: 1800,
            iconTheme: {
              primary: '#166534',
              secondary: '#ecfdf5',
            },
            style: {
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              color: '#14532d',
              border: '1px solid #86efac',
            },
          },
          error: {
            duration: 2600,
            iconTheme: {
              primary: '#991b1b',
              secondary: '#fef2f2',
            },
            style: {
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#7f1d1d',
              border: '1px solid #fca5a5',
            },
          },
          style: {
            borderRadius: '12px',
            background: '#f8fafc',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            boxShadow: '0 18px 38px rgba(15, 23, 42, 0.12)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;