'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToolState } from '../../context/ToolStateContext';

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function getStrength(length, types) {
  if (length < 8 || types < 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (length < 12 || types < 3) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
  if (length < 16 || types < 4) return { label: 'Strong', color: 'bg-green-500', width: '75%' };
  return { label: 'Very Strong', color: 'bg-indigo-500', width: '100%' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const { updateState } = useToolState();

  const activeTypes = Object.values(options).filter(Boolean).length;
  const strength = getStrength(length, activeTypes);

  // Push password state to shared context for live preview
  useEffect(() => {
    updateState('password', password);
    updateState('passwordStrength', strength);
    updateState('passwordLength', length);
  }, [password, strength, length, updateState]);

  const generate = useCallback(() => {
    const pool = Object.entries(options)
      .filter(([, v]) => v)
      .map(([k]) => CHARS[k])
      .join('');
    if (!pool) { setPassword('Select at least one character type'); return; }
    const arr = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    } else {
      arr.forEach((_, i) => (arr[i] = Math.floor(Math.random() * 0xffffffff)));
    }
    setPassword(Array.from(arr).map(n => pool[n % pool.length]).join(''));
  }, [length, options]);

  useEffect(() => { generate(); }, [generate]);

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">Password Length: {length}</label>
        </div>
        <input
          type="range" min={8} max={64} value={length}
          onChange={e => setLength(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1"><span>8</span><span>64</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries({ upper: 'Uppercase (A-Z)', lower: 'Lowercase (a-z)', numbers: 'Numbers (0-9)', symbols: 'Symbols (!@#$…)' }).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={e => setOptions(o => ({ ...o, [key]: e.target.checked }))}
              className="accent-indigo-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <code className={`flex-1 font-mono text-lg text-slate-900 break-all ${show ? '' : 'tracking-widest'}`}>
            {show ? password : password.replace(/./g, '•')}
          </code>
          <button onClick={() => setShow(s => !s)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors shrink-0">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Strength</span><span className="font-medium">{strength.label}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={generate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
        >
          ↻ Regenerate
        </button>
        <button
          onClick={copy}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 font-medium transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
