'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToolState } from '../../context/ToolStateContext';

const CATEGORIES = {
  Length: {
    units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    base: 'm',
  },
  Weight: {
    units: { mg: 0.001, g: 1, kg: 1000, t: 1e6, oz: 28.3495, lb: 453.592 },
    base: 'g',
  },
  Speed: {
    units: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 0.514444 },
    base: 'm/s',
  },
  Area: {
    units: { 'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, 'km²': 1e6, 'in²': 6.4516e-4, 'ft²': 0.092903, acre: 4046.86, ha: 10000 },
    base: 'm²',
  },
};

const TEMP = {
  '°C': { toBase: v => v, fromBase: v => v },
  '°F': { toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
  K:   { toBase: v => v - 273.15, fromBase: v => v + 273.15 },
};

function convert(cat, from, to, value) {
  if (cat === 'Temperature') {
    const base = TEMP[from].toBase(value);
    return TEMP[to].fromBase(base);
  }
  const { units } = CATEGORIES[cat];
  return (value * units[from]) / units[to];
}

export default function UnitConverter() {
  const [cat, setCat] = useState('Length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [value, setValue] = useState('1');
  const { updateState } = useToolState();

  const unitList = cat === 'Temperature' ? Object.keys(TEMP) : Object.keys(CATEGORIES[cat].units);

  const result = useMemo(() => {
    const n = parseFloat(value);
    if (isNaN(n)) return '';
    const r = convert(cat, from, to, n);
    return Number.isFinite(r) ? (Math.abs(r) < 0.001 || Math.abs(r) > 1e9 ? r.toExponential(6) : parseFloat(r.toPrecision(8)).toString()) : '—';
  }, [cat, from, to, value]);

  // Push conversion to shared context for live preview
  useEffect(() => {
    updateState('unitValue', value);
    updateState('unitFrom', from);
    updateState('unitTo', to);
    updateState('unitResult', result);
  }, [value, from, to, result, updateState]);

  const switchUnits = () => { const t = from; setFrom(to); setTo(t); };

  const handleCatChange = (c) => {
    setCat(c);
    const keys = c === 'Temperature' ? Object.keys(TEMP) : Object.keys(CATEGORIES[c].units);
    setFrom(keys[0]);
    setTo(keys[1] ?? keys[0]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div className="flex flex-wrap gap-2">
        {['Length', 'Weight', 'Temperature', 'Speed', 'Area'].map(c => (
          <button
            key={c}
            onClick={() => handleCatChange(c)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              cat === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 bg-white"
          >
            {unitList.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <button
          onClick={switchUnits}
          className="mb-0.5 h-10 w-10 flex items-center justify-center bg-slate-100 hover:bg-indigo-100 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors text-lg"
          title="Swap units"
        >
          ⇌
        </button>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 bg-white"
          >
            {unitList.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
        />
      </div>

      {result !== '' && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 text-center">
          <p className="text-sm text-slate-500 mb-1">{value} {from} =</p>
          <p className="text-4xl font-bold text-indigo-600">{result}</p>
          <p className="text-lg text-slate-700 mt-1">{to}</p>
        </div>
      )}
    </div>
  );
}
