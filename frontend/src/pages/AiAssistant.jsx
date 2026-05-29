import { useState } from 'react';
import api from '../services/api';

export default function AiAssistant() {
  const [message, setMessage] = useState('');
  const [extractResult, setExtractResult] = useState(null);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('extract');

  const handleExtract = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExtractResult(null);
    try {
      const { data } = await api.post('/ai/extract-order', { message });
      try {
        setExtractResult(JSON.parse(data.result));
      } catch {
        setExtractResult({ raw: data.result });
      }
    } catch { setExtractResult({ error: 'Failed to process' }); }
    finally { setLoading(false); }
  };

  const handleSuggest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestedReply('');
    try {
      const { data } = await api.post('/ai/suggest-reply', { message, context: '' });
      setSuggestedReply(data.reply);
    } catch { setSuggestedReply('Failed to generate reply'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">AI Assistant</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('extract')} className={`px-4 py-2 rounded text-sm ${tab === 'extract' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Extract Order
        </button>
        <button onClick={() => setTab('reply')} className={`px-4 py-2 rounded text-sm ${tab === 'reply' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Suggest Reply
        </button>
      </div>

      {/* Extract Order Tab */}
      {tab === 'extract' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-4">Paste a customer message and AI will extract order details (product, quantity, size, color).</p>
          <form onSubmit={handleExtract} className="space-y-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder='e.g. "I want 2 black sneakers size 42"'
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              required
            />
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Extracting...' : 'Extract Order Details'}
            </button>
          </form>

          {extractResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-2">Extracted Details:</p>
              {extractResult.error ? (
                <p className="text-red-500 text-sm">{extractResult.error}</p>
              ) : extractResult.raw ? (
                <p className="text-sm text-gray-700">{extractResult.raw}</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {extractResult.productName && <p><span className="text-gray-500">Product:</span> {extractResult.productName}</p>}
                  {extractResult.quantity && <p><span className="text-gray-500">Quantity:</span> {extractResult.quantity}</p>}
                  {extractResult.size && <p><span className="text-gray-500">Size:</span> {extractResult.size}</p>}
                  {extractResult.color && <p><span className="text-gray-500">Color:</span> {extractResult.color}</p>}
                  {extractResult.notes && <p><span className="text-gray-500">Notes:</span> {extractResult.notes}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Suggest Reply Tab */}
      {tab === 'reply' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-4">Paste a customer message and AI will suggest a friendly reply.</p>
          <form onSubmit={handleSuggest} className="space-y-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder='e.g. "How much is the black bag? Do you deliver to Lagos?"'
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              required
            />
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Generating...' : 'Suggest Reply'}
            </button>
          </form>

          {suggestedReply && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-2">Suggested Reply:</p>
              <p className="text-sm text-gray-700">{suggestedReply}</p>
              <button onClick={() => navigator.clipboard.writeText(suggestedReply)} className="mt-2 text-indigo-600 text-xs hover:underline">
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
