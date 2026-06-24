'use client';

import { useState, useEffect } from 'react';
import { useToolState } from '../../context/ToolStateContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(300);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState(null);
  const { updateState } = useToolState();

  // Push QR code to shared context for preview
  useEffect(() => {
    updateState('qrDataUrl', qrDataUrl);
  }, [qrDataUrl, updateState]);

  const generate = async () => {
    if (!text.trim()) { setError('Please enter text or URL'); return; }
    setLoading(true); setError(''); setQrDataUrl(null);
    try {
      const res = await fetch(`${API}/api/file/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setQrDataUrl(data.data.qrDataUrl);
      setGeneratedAt(new Date().toLocaleString());
    } catch (e) {
      setError(e.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Text or URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Enter URL or text..."
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
          />
          <button
            onClick={generate}
            disabled={loading || !text.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">QR Size (px)</label>
        <div className="flex gap-2">
          {[200, 300, 400, 500].map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                size === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}

      {qrDataUrl && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center gap-4">
          <img
            src={qrDataUrl}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded-lg shadow-sm"
            style={{ imageRendering: 'pixelated' }}
          />
          {generatedAt && (
            <p className="text-xs text-slate-400">Generated at {generatedAt}</p>
          )}
          <a
            href={qrDataUrl}
            download="qr-code.png"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
          >
            ⬇ Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}
