'use client';
import { useState, useEffect, useRef } from 'react';

function decodeJWT(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 parts separated by dots');
  const base64Decode = (str) => {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=');
    return JSON.parse(atob(padded));
  };
  return {
    header: base64Decode(parts[0]),
    payload: base64Decode(parts[1]),
    signature: parts[2],
    raw: parts,
  };
}

function formatDate(ts) {
  return new Date(ts * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function daysDiff(ts) {
  return Math.round((ts * 1000 - Date.now()) / 86400000);
}

function JsonHighlight({ obj }) {
  const lines = JSON.stringify(obj, null, 2).split('\n');
  return (
    <pre className="text-xs font-mono whitespace-pre-wrap leading-5">
      {lines.map((line, i) => {
        const keyMatch = line.match(/^(\s*)(".*?")(: )(.*)/);
        if (keyMatch) {
          const [, indent, key, colon, val] = keyMatch;
          let valEl;
          if (val === '{' || val === '[' || val === '}' || val === ']' || val === '},' || val === '],') {
            valEl = <span className="text-slate-500">{val}</span>;
          } else if (val.startsWith('"')) {
            valEl = <span className="text-green-600">{val}</span>;
          } else if (val === 'true' || val === 'false' || val === 'null' || val.startsWith('null')) {
            valEl = <span className="text-purple-600">{val}</span>;
          } else {
            valEl = <span className="text-blue-600">{val}</span>;
          }
          return <span key={i}>{indent}<span className="text-slate-800 font-semibold">{key}</span>{colon}{valEl}{'\n'}</span>;
        }
        return <span key={i} className="text-slate-500">{line}{'\n'}</span>;
      })}
    </pre>
  );
}

function ClaimRow({ k, v }) {
  if (k === 'exp') {
    const diff = daysDiff(v);
    return (
      <div className="text-xs mt-1">
        <span className="text-slate-500">exp → </span>
        <span className="font-medium">{formatDate(v)}</span>
        {diff < 0
          ? <span className="ml-2 bg-red-100 text-red-700 rounded px-1.5 py-0.5 font-semibold">EXPIRED {Math.abs(diff)}d ago ⚠️</span>
          : <span className="ml-2 bg-green-100 text-green-700 rounded px-1.5 py-0.5">Expires in {diff}d</span>}
      </div>
    );
  }
  if (k === 'iat') {
    const diff = Math.abs(daysDiff(v));
    return <div className="text-xs mt-1"><span className="text-slate-500">iat → </span><span className="font-medium">{formatDate(v)}</span> <span className="text-slate-400">({diff}d ago)</span></div>;
  }
  if (k === 'nbf') return <div className="text-xs mt-1"><span className="text-slate-500">nbf → </span><span className="font-medium">{formatDate(v)}</span></div>;
  if (k === 'sub') return <div className="text-xs mt-1"><span className="text-slate-500">sub → </span><span className="font-medium text-indigo-700">{v}</span></div>;
  if (k === 'iss') return <div className="text-xs mt-1"><span className="text-slate-500">iss → </span><span className="font-medium">{v}</span></div>;
  return null;
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!token.trim()) { setDecoded(null); setError(''); return; }
      try {
        setDecoded(decodeJWT(token));
        setError('');
      } catch (e) {
        setDecoded(null);
        setError(e.message);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [token]);

  const specialClaims = decoded ? Object.entries(decoded.payload).filter(([k]) => ['exp','iat','nbf','sub','iss'].includes(k)) : [];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">JWT Token</label>
        <textarea rows={3} value={token} onChange={e => setToken(e.target.value)}
          placeholder="Paste your JWT token here... eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
          className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-xs resize-none" />

        {decoded && (
          <div className="mt-3 flex flex-wrap gap-1 font-mono text-xs break-all">
            <span className="bg-indigo-100 text-indigo-800 rounded px-1">{decoded.raw[0]}</span>
            <span className="text-slate-400">.</span>
            <span className="bg-green-100 text-green-800 rounded px-1">{decoded.raw[1]}</span>
            <span className="text-slate-400">.</span>
            <span className="bg-slate-200 text-slate-600 rounded px-1">{decoded.raw[2].slice(0, 20)}…</span>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      {decoded && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-purple-200 overflow-hidden shadow-sm">
            <div className="bg-purple-50 px-5 py-3 flex items-center justify-between">
              <span className="font-semibold text-purple-800 text-sm">Header</span>
              <span className="text-xs bg-purple-200 text-purple-800 rounded-full px-2 py-0.5 font-mono">{decoded.header.alg || 'unknown'}</span>
            </div>
            <div className="p-5"><JsonHighlight obj={decoded.header} /></div>
          </div>

          <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-sm">
            <div className="bg-blue-50 px-5 py-3">
              <span className="font-semibold text-blue-800 text-sm">Payload</span>
            </div>
            <div className="p-5">
              {specialClaims.length > 0 && (
                <div className="mb-4 bg-slate-50 rounded-xl p-3 space-y-0.5">
                  {specialClaims.map(([k, v]) => <ClaimRow key={k} k={k} v={v} />)}
                </div>
              )}
              <JsonHighlight obj={decoded.payload} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3">
              <span className="font-semibold text-slate-700 text-sm">Signature</span>
            </div>
            <div className="p-5">
              <div className="bg-slate-900 text-green-400 rounded-xl p-4 font-mono text-xs break-all">{decoded.signature}</div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3">
                ⚠️ Signature NOT verified — this is a client-side decode only. Do not trust claims without server-side verification.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 px-1">🔒 Your token is decoded entirely in your browser. Nothing is sent to any server.</p>
    </div>
  );
}
