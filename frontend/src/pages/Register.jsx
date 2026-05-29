import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ businessName: '', email: '', password: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center text-indigo-600">Vendora</h2>
        <p className="text-center text-gray-500 text-sm">Create your seller account</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input placeholder="Business Name" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} className="w-full border rounded px-3 py-2" required />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" required />
        <input placeholder="Phone Number" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} className="w-full border rounded px-3 py-2" required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded px-3 py-2" required />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
