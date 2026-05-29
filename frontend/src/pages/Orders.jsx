import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ productName: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [linkModal, setLinkModal] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (filter === 'All') setFiltered(orders);
    else setFiltered(orders.filter(o => o.paymentStatus === filter || o.deliveryStatus === filter));
  }, [filter, orders]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', { productName: form.productName, amount: parseFloat(form.amount) });
      setForm({ productName: '', amount: '' });
      setShowCreate(false);
      fetchOrders();
    } catch { alert('Failed to create order'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, field, value) => {
    await api.patch(`/orders/${id}`, { [field]: value });
    fetchOrders();
  };

  const generateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments/create-link', {
        orderId: linkModal.id,
        customerEmail: email,
        callbackBaseUrl: window.location.origin
      });
      const checkoutLink = `${window.location.origin}/checkout/${linkModal.id}`;
      navigator.clipboard.writeText(checkoutLink);
      alert('Checkout link copied! Send this to your customer.');
      setLinkModal(null);
      setEmail('');
      fetchOrders();
    } catch { alert('Failed to generate link'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm">
          + New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', 'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Payment</th>
                <th className="text-left px-4 py-2">Delivery</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.productName}</td>
                  <td className="px-4 py-2">₦{order.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <select value={order.paymentStatus} onChange={e => updateStatus(order.id, 'paymentStatus', e.target.value)} className="border rounded px-2 py-1 text-xs">
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Failed</option>
                      <option>Refunded</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select value={order.deliveryStatus} onChange={e => updateStatus(order.id, 'deliveryStatus', e.target.value)} className="border rounded px-2 py-1 text-xs">
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => navigate(`/orders/${order.id}`)} className="text-gray-600 hover:text-gray-800 text-xs">View</button>
                    <button onClick={() => setLinkModal(order)} className="text-indigo-600 hover:text-indigo-800 text-xs">Pay Link</button>
                    <button onClick={() => updateStatus(order.id, 'deliveryStatus', 'Cancelled')} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Payment Link Modal */}
      {linkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={generateLink} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">Generate Payment Link</h2>
            <p className="text-sm text-gray-500">{linkModal.productName} — ₦{linkModal.amount.toLocaleString()}</p>
            <input type="email" placeholder="Customer Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate & Copy'}
              </button>
              <button type="button" onClick={() => setLinkModal(null)} className="flex-1 border py-2 rounded hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">Create Order</h2>
            <input placeholder="Product Name" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="number" placeholder="Amount (₦)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
