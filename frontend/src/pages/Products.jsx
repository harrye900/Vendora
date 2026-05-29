import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/products', { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) });
      setForm({ name: '', price: '', stock: '' });
      setShowCreate(false);
      fetchProducts();
    } catch { alert('Failed to add product'); }
    finally { setLoading(false); }
  };

  const updateStock = async (id) => {
    await api.patch(`/products/${id}`, { stock: parseInt(editStock) });
    setEditId(null);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm">
          + Add Product
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium text-sm">⚠️ Low Stock Alert</p>
          <p className="text-red-600 text-xs mt-1">
            {lowStock.map(p => `${p.name} (${p.stock} left)`).join(', ')}
          </p>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Price</th>
                <th className="text-left px-4 py-2">Stock</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">₦{p.price.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {editId === p.id ? (
                      <div className="flex gap-1">
                        <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="border rounded px-2 py-1 w-16 text-xs" />
                        <button onClick={() => updateStock(p.id)} className="text-green-600 text-xs">✓</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 text-xs">✕</button>
                      </div>
                    ) : (
                      <span onClick={() => { setEditId(p.id); setEditStock(p.stock.toString()); }} className="cursor-pointer hover:text-indigo-600">
                        {p.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">Add Product</h2>
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="number" placeholder="Price (₦)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="number" placeholder="Stock Quantity" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Adding...' : 'Add Product'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
