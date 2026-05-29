import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/stats').then(res => setStats(res.data)).catch(() => setStats({ totalOrders: 0, pendingPayments: 0, paidOrders: 0, shippedOrders: 0, deliveredOrders: 0, revenue: 0 }));
    api.get('/orders').then(res => setRecentOrders(res.data.slice(0, 5))).catch(() => setRecentOrders([]));
  }, []);

  if (!stats) return <p className="text-gray-500">Loading...</p>;

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Pending Payments', value: stats.pendingPayments, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Paid Orders', value: stats.paidOrders, color: 'bg-green-100 text-green-800' },
    { label: 'Shipped', value: stats.shippedOrders, color: 'bg-blue-100 text-blue-800' },
    { label: 'Delivered', value: stats.deliveredOrders, color: 'bg-purple-100 text-purple-800' },
    { label: 'Revenue', value: `₦${stats.revenue.toLocaleString()}`, color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
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
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.productName}</td>
                  <td className="px-4 py-2">₦{order.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
