'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Base64Tool() {
  const [tab, setTab] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = async () => {
    if (!input.trim()) { setError('Please enter some text'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const res = await fetch(`${API}/api/file/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, action: tab }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOutput(data.data.result);
    } catch (e) {
      setError(e.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {['encode', 'decode'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setOutput(''); setError(''); }}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {tab === 'encode' ? 'Plain Text' : 'Base64 String'}
        </label>
        <textarea
          rows={8}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={tab === 'encode' ? 'Enter text to encode…' : 'Enter Base64 string to decode…'}
          className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-sm resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={process}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing…' : tab === 'encode' ? 'Encode →' : 'Decode →'}
        </button>
        <button
          onClick={clear}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 font-medium transition-colors"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}

      {output && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              {tab === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <button onClick={copy} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            rows={8}
            readOnly
            value={output}
            className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none w-full text-slate-900 font-mono text-sm resize-none bg-white"
          />
        </div>
      )}
    </div>
  );
}
