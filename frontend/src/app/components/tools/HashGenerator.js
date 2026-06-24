'use client';
import { useState, useEffect, useRef } from 'react';

const BIT_SIZES = { 'SHA-1': '160-bit', 'SHA-256': '256-bit', 'SHA-384': '384-bit', 'SHA-512': '512-bit' };

async function generateHashes(input) {
  const buffer = input instanceof ArrayBuffer ? input : new TextEncoder().encode(input);
  const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
  const results = {};
  for (const algo of algos) {
    const hashBuf = await crypto.subtle.digest(algo, buffer);
    results[algo] = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return results;
}

export default function HashGenerator() {
  const [mode, setMode] = useState('text');
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (mode !== 'text') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!input.trim()) { setHashes({}); return; }
      setLoading(true);
      const h = await generateHashes(input);
      setHashes(h);
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input, mode]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);
    const buf = await f.arrayBuffer();
    const h = await generateHashes(buf);
    setHashes(h);
    setLoading(false);
  };

  const handleCopy = (algo, hash) => {
    navigator.clipboard.writeText(hash);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex gap-2">
          {['text', 'file'].map(m => (
            <button key={m} onClick={() => { setMode(m); setHashes({}); setFile(null); setInput(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {m === 'text' ? '📝 Text' : '📁 File'}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Input Text</label>
            <textarea rows={4} value={input} onChange={e => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-sm resize-none" />
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors">
            <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div><div className="text-3xl mb-2">📁</div><p className="font-medium text-slate-900">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB</p></div>
            ) : (
              <div><div className="text-4xl mb-2">📁</div><p className="font-medium text-slate-700">Drop any file or click to browse</p><p className="text-sm text-slate-400 mt-1">Hash will be computed from file contents</p></div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-500 text-sm px-2">
          <span className="animate-spin border-2 border-indigo-600 border-t-transparent rounded-full w-4 h-4 inline-block" />
          Computing hashes...
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{algo}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{BIT_SIZES[algo]}</span>
                </div>
                <button onClick={() => handleCopy(algo, hash)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium">
                  {copied === algo ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-slate-900 text-green-400 rounded-xl p-4 font-mono text-xs break-all leading-relaxed">
                {hash}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400 px-1">💡 SHA-256 is the industry standard for file integrity and digital signatures.</p>
        </div>
      )}
    </div>
  );
}
