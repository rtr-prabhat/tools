'use client';

import { useState, useCallback } from 'react';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
      case gg: h = ((bb - rr) / d + 2) / 6; break;
      default: h = ((rr - gg) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }) {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  if (ss === 0) { const v = Math.round(ll * 255); return { r: v, g: v, b: v }; }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const toRgb = t => {
    const tt = ((t % 1) + 1) % 1;
    if (tt < 1/6) return p + (q - p) * 6 * tt;
    if (tt < 1/2) return q;
    if (tt < 2/3) return p + (q - p) * (2/3 - tt) * 6;
    return p;
  };
  return { r: Math.round(toRgb(hh + 1/3) * 255), g: Math.round(toRgb(hh) * 255), b: Math.round(toRgb(hh - 1/3) * 255) };
}

function getLuminance({ r, g, b }) {
  const [rr, gg, bb] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

export default function ColorConverter() {
  const [tab, setTab] = useState('hex');
  const [hex, setHex] = useState('#6366f1');
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });
  const [copied, setCopied] = useState('');

  const sync = useCallback((source, value) => {
    let r, g, b;
    if (source === 'hex') {
      const parsed = hexToRgb(value);
      if (!parsed) return;
      ({ r, g, b } = parsed);
      setRgb({ r, g, b });
      setHsl(rgbToHsl({ r, g, b }));
    } else if (source === 'rgb') {
      ({ r, g, b } = value);
      setHex(rgbToHex({ r, g, b }));
      setHsl(rgbToHsl({ r, g, b }));
    } else {
      ({ r, g, b } = hslToRgb(value));
      setRgb({ r, g, b });
      setHex(rgbToHex({ r, g, b }));
    }
  }, []);

  const copyVal = async (val, key) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const textColor = getLuminance(rgb) > 0.179 ? '#1e293b' : '#ffffff';

  const outputs = [
    { label: 'HEX', value: hex, key: 'hex' },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, key: 'rgb' },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, key: 'hsl' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div
        className="h-28 rounded-2xl flex items-center justify-center transition-colors text-lg font-semibold"
        style={{ backgroundColor: hex, color: textColor }}
      >
        {hex.toUpperCase()}
        <span className="ml-3 text-sm opacity-70">
          {getLuminance(rgb) > 0.179 ? '→ use dark text' : '→ use light text'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 shrink-0">Pick color:</label>
        <input
          type="color"
          value={hex}
          onChange={e => { setHex(e.target.value); sync('hex', e.target.value); }}
          className="h-9 w-14 rounded-lg border border-slate-200 cursor-pointer p-0.5"
        />
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {['hex', 'rgb', 'hsl'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ${
              tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'hex' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">HEX Value</label>
          <input
            type="text"
            value={hex}
            onChange={e => { setHex(e.target.value); sync('hex', e.target.value); }}
            placeholder="#000000"
            maxLength={7}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono"
          />
        </div>
      )}

      {tab === 'rgb' && (
        <div className="grid grid-cols-3 gap-3">
          {['r', 'g', 'b'].map(c => (
            <div key={c}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{c.toUpperCase()} (0–255)</label>
              <input
                type="number" min={0} max={255}
                value={rgb[c]}
                onChange={e => {
                  const v = { ...rgb, [c]: Math.min(255, Math.max(0, Number(e.target.value))) };
                  setRgb(v); sync('rgb', v);
                }}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'hsl' && (
        <div className="grid grid-cols-3 gap-3">
          {[['h', 'H (0–360)', 360], ['s', 'S (0–100)', 100], ['l', 'L (0–100)', 100]].map(([c, lbl, max]) => (
            <div key={c}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{lbl}</label>
              <input
                type="number" min={0} max={max}
                value={hsl[c]}
                onChange={e => {
                  const v = { ...hsl, [c]: Math.min(max, Math.max(0, Number(e.target.value))) };
                  setHsl(v); sync('hsl', v);
                }}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
        <p className="text-sm font-medium text-slate-700 mb-2">All Formats</p>
        {outputs.map(({ label, value, key }) => (
          <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 mr-2">{label}</span>
              <code className="text-sm text-slate-900 font-mono">{value}</code>
            </div>
            <button
              onClick={() => copyVal(value, key)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors"
            >
              {copied === key ? '✓' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
