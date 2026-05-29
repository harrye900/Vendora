import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data.order);
    setCustomer(data.customer);
    setNotes(data.order.shippingNotes || '');
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateStatus = async (status) => {
    setLoading(true);
    await api.patch(`/orders/${id}`, { deliveryStatus: status, shippingNotes: notes });
    await fetchOrder();
    setLoading(false);
  };

  const saveNotes = async () => {
    await api.patch(`/orders/${id}`, { shippingNotes: notes });
    await fetchOrder();
  };

  if (!order) return <p className="text-gray-500">Loading...</p>;

  const timeline = [
    { label: 'Order Created', date: order.createdAt, done: true },
    { label: 'Payment Received', date: order.paymentStatus === 'Paid' ? order.createdAt : null, done: order.paymentStatus === 'Paid' },
    { label: 'Shipped', date: order.shippedAt, done: !!order.shippedAt },
    { label: 'Delivered', date: order.deliveredAt, done: !!order.deliveredAt },
  ];

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/orders')} className="text-indigo-600 hover:underline text-sm mb-4">← Back to Orders</button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{order.productName}</h1>
            <p className="text-2xl font-bold text-gray-800 mt-1">₦{order.amount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.paymentStatus}
            </span>
            <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {order.deliveryStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-3">Customer</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Name:</span> {customer.name}</p>
            <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
            <p><span className="text-gray-500">Address:</span> {customer.address}</p>
            <p><span className="text-gray-500">City:</span> {customer.city}, {customer.state}</p>
          </div>
        </div>
      )}

      {/* Delivery Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Delivery Timeline</h2>
        <div className="space-y-4">
          {timeline.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${step.done ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <p className={`text-sm font-medium ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                {step.done && step.date && <p className="text-xs text-gray-400">{new Date(step.date).toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Notes & Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">Shipping Notes</h2>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add tracking info, courier name, etc." className="w-full border rounded px-3 py-2 text-sm mb-3" rows={3} />
        <div className="flex gap-2 flex-wrap">
          <button onClick={saveNotes} className="px-4 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Save Notes</button>
          {order.deliveryStatus === 'Processing' && (
            <button onClick={() => updateStatus('Shipped')} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              Mark as Shipped
            </button>
          )}
          {order.deliveryStatus === 'Shipped' && (
            <button onClick={() => updateStatus('Delivered')} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
