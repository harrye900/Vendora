import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics').then(res => setData(res.data));
  }, []);

  if (!data) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₦${data.totalRevenue.toLocaleString()}`} color="bg-emerald-100 text-emerald-800" />
        <StatCard label="Total Orders" value={data.totalOrders} color="bg-indigo-100 text-indigo-800" />
        <StatCard label="Paid Orders" value={data.paidOrders} color="bg-green-100 text-green-800" />
        <StatCard label="Avg Order Value" value={`₦${Math.round(data.avgOrderValue).toLocaleString()}`} color="bg-blue-100 text-blue-800" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.monthlyRevenue.map(m => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{m.month}</span>
                  <div className="flex-1 bg-gray-100 rounded h-6 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded"
                      style={{ width: `${Math.min((m.revenue / Math.max(...data.monthlyRevenue.map(x => x.revenue))) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-24 text-right">₦{m.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Orders (Last 7 days) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Orders (Last 7 Days)</h2>
          {data.dailyOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.dailyOrders.map(d => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{d.date}</span>
                  <div className="flex-1 bg-gray-100 rounded h-6 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded"
                      style={{ width: `${Math.min((d.orders / Math.max(...data.dailyOrders.map(x => x.orders))) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">{d.orders}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Top Products</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-left px-3 py-2">Sales</th>
                <th className="text-left px-3 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={p.product} className="border-t">
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{p.product}</td>
                  <td className="px-3 py-2">{p.sales}</td>
                  <td className="px-3 py-2">₦{p.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
