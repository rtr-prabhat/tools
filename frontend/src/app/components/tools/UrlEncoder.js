'use client';
import { useState } from 'react';

const EXAMPLES_ENCODE = ['hello world & stuff', 'name=John Doe&city=New Delhi'];
const EXAMPLES_DECODE = ['hello%20world%20%26%20stuff', 'https%3A%2F%2Fexample.com%2Fpath%3Fkey%3Dvalue'];
const EXAMPLE_URLS = ['https://example.com/path?key=value&name=john doe#section', 'https://api.example.com:8080/v1/users?id=42&filter=active'];

function parseUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const params = [];
    u.searchParams.forEach((v, k) => params.push({ k, v }));
    return { ok: true, protocol: u.protocol, host: u.hostname, port: u.port || '(default)', path: u.pathname, params, hash: u.hash || '(none)' };
  } catch {
    return { ok: false };
  }
}

export default function UrlEncoder() {
  const [mode, setMode] = useState('encode');
  const [method, setMethod] = useState('component');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');

  const convert = () => {
    try {
      let result;
      if (mode === 'encode') {
        result = method === 'component' ? encodeURIComponent(input) : encodeURI(input);
      } else {
        result = method === 'component' ? decodeURIComponent(input) : decodeURI(input);
      }
      setOutput(result);
    } catch (e) {
      setOutput('Error: ' + e.message);
    }
  };

  const doParse = () => {
    const r = parseUrl(urlInput);
    if (r.ok) { setParsed(r); setParseError(''); }
    else { setParsed(null); setParseError('Invalid URL — must start with http:// or https://'); }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const examples = mode === 'encode' ? EXAMPLES_ENCODE : EXAMPLES_DECODE;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {['encode', 'decode'].map(m => (
            <button key={m} onClick={() => { setMode(m); setOutput(''); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Method selector */}
        <div className="flex gap-2">
          {[{ id: 'component', label: 'Query Value (encodeURIComponent)' }, { id: 'uri', label: 'Full URL (encodeURI)' }].map(opt => (
            <button key={opt.id} onClick={() => setMethod(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${method === opt.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {examples.map(ex => (
            <button key={ex} onClick={() => { setInput(ex); setOutput(''); }}
              className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-full px-3 py-1 transition-colors truncate max-w-xs">
              {ex}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Input {mode === 'encode' ? '(plain text)' : '(encoded string)'}
          </label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setOutput(''); }}
            rows={4}
            placeholder={mode === 'encode' ? 'Type text to encode...' : 'Paste encoded string...'}
            className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={convert}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors">
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button onClick={() => { setInput(''); setOutput(''); }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-6 py-3 font-medium transition-colors">
            Clear
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Result</label>
              <button onClick={copy}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-900 break-all">
              {output}
            </div>
          </div>
        )}
      </div>

      {/* URL Parser */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-800">🔍 URL Parser</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_URLS.map(ex => (
            <button key={ex} onClick={() => { setUrlInput(ex); setParsed(null); }}
              className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-full px-3 py-1 transition-colors truncate max-w-sm">
              {ex}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setParsed(null); setParseError(''); }}
            placeholder="https://example.com/path?key=value"
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-sm"
          />
          <button onClick={doParse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 font-medium transition-colors shrink-0">
            Parse
          </button>
        </div>
        {parseError && <p className="text-red-600 text-sm">{parseError}</p>}
        {parsed && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            {[
              { label: 'Protocol', value: parsed.protocol },
              { label: 'Host', value: parsed.host },
              { label: 'Port', value: parsed.port },
              { label: 'Path', value: parsed.path },
              { label: 'Hash', value: parsed.hash },
            ].map(row => (
              <div key={row.label} className="flex border-b border-slate-200 last:border-0">
                <span className="w-24 shrink-0 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 uppercase">{row.label}</span>
                <span className="px-3 py-2 font-mono text-sm text-slate-800 break-all">{row.value}</span>
              </div>
            ))}
            {parsed.params.length > 0 && (
              <div className="flex border-b border-slate-200 last:border-0">
                <span className="w-24 shrink-0 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Params</span>
                <div className="px-3 py-2 space-y-1 w-full">
                  {parsed.params.map(({ k, v }) => (
                    <div key={k} className="flex gap-2 font-mono text-sm">
                      <span className="text-indigo-600 font-medium">{k}</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
