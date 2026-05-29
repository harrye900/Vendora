import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/orders', label: 'Orders' },
    { to: '/customers', label: 'Customers' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/products', label: 'Products' },
    { to: '/ai', label: 'AI' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600">Vendora</Link>
          {/* Desktop nav */}
          <div className="hidden md:flex gap-4 items-center">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-700 hover:text-indigo-600 text-sm">{link.label}</Link>
            ))}
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm">Logout</button>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 text-2xl">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-indigo-600 text-sm py-1">{link.label}</Link>
            ))}
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm text-left py-1">Logout</button>
          </div>
        )}
      </nav>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
