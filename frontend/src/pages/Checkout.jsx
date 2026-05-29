import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

export default function Checkout() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/checkout/${orderId}`).then(res => setOrder(res.data)).catch(() => setError('Order not found'));
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/checkout/${orderId}/customer`, form);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError('Payment link not available yet');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  if (order.paymentStatus === 'Paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-green-600 text-xl font-bold">✓ Payment Confirmed</p>
          <p className="text-gray-500 mt-2">This order has already been paid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow w-full max-w-md p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-indigo-600">Vendora Checkout</h1>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p className="font-medium">{order.productName}</p>
            <p className="text-2xl font-bold text-gray-800">₦{order.amount.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="font-semibold text-gray-700">Delivery Information</h2>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <input placeholder="Delivery Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <div className="flex gap-2">
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full border rounded px-3 py-2" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
