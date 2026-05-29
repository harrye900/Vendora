import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    const { data } = await api.get('/customers', { params: search ? { search } : {} });
    setCustomers(data);
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border rounded px-3 py-2 mb-4"
      />

      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-left px-4 py-2">Orders</th>
                <th className="text-left px-4 py-2">Last Order</th>
                <th className="text-left px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.phone} className="border-t">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2 text-gray-500">{c.city}, {c.state}</td>
                  <td className="px-4 py-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{c.totalOrders}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => navigate(`/customers/${c.phone}`)} className="text-indigo-600 hover:underline text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
