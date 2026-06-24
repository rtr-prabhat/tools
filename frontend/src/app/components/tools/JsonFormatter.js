'use client';

import { useState, useEffect } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [validation, setValidation] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) { setValidation(null); return; }
    try { JSON.parse(input); setValidation({ valid: true }); }
    catch (e) { setValidation({ valid: false, error: e.message }); }
  }, [input]);

  const format = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, indent));
    } catch (e) {
      setValidation({ valid: false, error: e.message });
    }
  };

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
    } catch (e) {
      setValidation({ valid: false, error: e.message });
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => { setInput(''); setOutput(''); setValidation(null); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {[2, 4].map(n => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                indent === n
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {n} spaces
            </button>
          ))}
        </div>

        {validation && (
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            validation.valid
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {validation.valid ? '✅ Valid JSON' : '❌ Invalid JSON'}
          </span>
        )}

        <div className="flex gap-2 ml-auto">
          <button
            onClick={format}
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Format
          </button>
          <button
            onClick={minify}
            disabled={!input.trim()}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Minify
          </button>
          <button
            onClick={clear}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error bar */}
      {validation && !validation.valid && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-xs font-mono">
          {validation.error}
        </div>
      )}

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Input JSON</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {input.trim() ? `${input.trim().length} chars` : 'paste or type JSON'}
            </span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
            className="flex-1 px-4 py-3 focus:outline-none w-full text-slate-900 dark:text-slate-100 font-mono text-sm resize-none bg-white dark:bg-slate-900 placeholder-slate-300 dark:placeholder-slate-600"
            style={{ minHeight: '480px' }}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Output</span>
            <button
              onClick={copy}
              disabled={!output}
              className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg px-3 py-1 transition-colors disabled:opacity-40"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Formatted output will appear here…"
            className="flex-1 px-4 py-3 w-full text-slate-900 dark:text-slate-100 font-mono text-sm resize-none bg-white dark:bg-slate-900 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none"
            style={{ minHeight: '480px' }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
