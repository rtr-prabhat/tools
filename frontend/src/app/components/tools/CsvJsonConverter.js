'use client';
import { useState, useCallback } from 'react';

const SAMPLE_CSV = `Name,Age,City,Salary
Alice,30,Mumbai,75000
Bob,25,Delhi,60000
Charlie,35,Bangalore,90000
Diana,28,Chennai,70000`;

const SAMPLE_JSON = `[
  {"name":"Alice","age":30,"city":"Mumbai"},
  {"name":"Bob","age":25,"city":"Delhi"},
  {"name":"Charlie","age":35,"city":"Bangalore"}
]`;

function csvToJson(csv, delim) {
  const lines = csv.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
  const parseRow = (line) => {
    const vals = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === delim && !inQ) { vals.push(cur.replace(/^"|"$/g, '')); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.replace(/^"|"$/g, ''));
    return vals.map(v => v.trim());
  };
  const headers = parseRow(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
}

function jsonToCsv(jsonStr, delim) {
  const data = JSON.parse(jsonStr);
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length) throw new Error('JSON array is empty');
  const headers = [...new Set(arr.flatMap(o => Object.keys(o)))];
  const esc = (v) => {
    const s = String(v ?? '');
    return (s.includes(delim) || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(delim), ...arr.map(r => headers.map(h => esc(r[h])).join(delim))].join('\n');
}

const DELIMITERS = [
  { label: 'Comma', value: ',' },
  { label: 'Semicolon', value: ';' },
  { label: 'Tab', value: '\t' },
  { label: 'Pipe', value: '|' },
];

export default function CsvJsonConverter() {
  const [mode, setMode] = useState('csv-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [pretty, setPretty] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      if (mode === 'csv-to-json') {
        const result = csvToJson(input, delimiter);
        setOutput(pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result));
      } else {
        setOutput(jsonToCsv(input, delimiter));
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, mode, delimiter, pretty]);

  const getStats = () => {
    if (!input.trim()) return null;
    try {
      if (mode === 'csv-to-json') {
        const lines = input.trim().split('\n').filter(l => l.trim());
        const cols = lines[0]?.split(delimiter).length || 0;
        return `${lines.length - 1} rows × ${cols} columns`;
      } else {
        const data = JSON.parse(input);
        const arr = Array.isArray(data) ? data : [data];
        return `${arr.length} items`;
      }
    } catch { return null; }
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = mode === 'csv-to-json' ? 'json' : 'csv';
    const mime = mode === 'csv-to-json' ? 'application/json' : 'text/csv';
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `converted.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput(mode === 'csv-to-json' ? SAMPLE_CSV : SAMPLE_JSON);
    setOutput('');
    setError('');
  };

  const stats = getStats();

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        <div className="flex gap-2">
          {[['csv-to-json', 'CSV → JSON'], ['json-to-csv', 'JSON → CSV']].map(([val, label]) => (
            <button key={val} onClick={() => { setMode(val); setInput(''); setOutput(''); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mode === val ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Delimiter:</span>
          {DELIMITERS.map(d => (
            <button key={d.value} onClick={() => setDelimiter(d.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${delimiter === d.value ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {d.label}
            </button>
          ))}
          {mode === 'csv-to-json' && (
            <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
              <input type="checkbox" checked={pretty} onChange={e => setPretty(e.target.checked)} className="accent-indigo-600" />
              <span className="text-xs text-slate-600">Pretty print</span>
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">{mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}</label>
            <div className="flex items-center gap-2">
              {stats && <span className="text-xs text-slate-400">{stats}</span>}
              <button onClick={loadSample} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium">Load Sample</button>
            </div>
          </div>
          <textarea rows={10} value={input} onChange={e => { setInput(e.target.value); setOutput(''); setError(''); }}
            placeholder={mode === 'csv-to-json' ? 'Paste CSV here...' : 'Paste JSON array here...'}
            className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-xs resize-none" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">{mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}</label>
            <div className="flex gap-2">
              <button onClick={handleCopy} disabled={!output} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium disabled:opacity-40">
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={handleDownload} disabled={!output} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium disabled:opacity-40">
                ⬇️ Download
              </button>
            </div>
          </div>
          <textarea rows={10} readOnly value={output}
            placeholder="Output will appear here after conversion..."
            className="border border-slate-200 rounded-xl px-4 py-3 w-full text-slate-900 font-mono text-xs resize-none bg-slate-50 focus:outline-none" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      <button onClick={convert} disabled={!input.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-base">
        Convert ⇄
      </button>
    </div>
  );
}
