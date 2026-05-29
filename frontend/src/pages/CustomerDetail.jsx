import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CustomerDetail() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get(`/customers/${phone}`).then(res => {
      setCustomer(res.data.customer);
      setOrders(res.data.orders);
    });
  }, [phone]);

  if (!customer) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/customers')} className="text-indigo-600 hover:underline text-sm mb-4">← Back to Customers</button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-xl font-bold">{customer.name}</h1>
        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
          <p><span className="text-gray-500">Address:</span> {customer.address}</p>
          <p><span className="text-gray-500">City:</span> {customer.city}</p>
          <p><span className="text-gray-500">State:</span> {customer.state}</p>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="bg-indigo-50 rounded px-4 py-2">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-lg font-bold text-indigo-700">{orders.length}</p>
          </div>
          <div className="bg-green-50 rounded px-4 py-2">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-bold text-green-700">₦{orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-left px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Payment</th>
                <th className="text-left px-3 py-2">Delivery</th>
                <th className="text-left px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-3 py-2">{order.productName}</td>
                  <td className="px-3 py-2">₦{order.amount.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{order.deliveryStatus}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
