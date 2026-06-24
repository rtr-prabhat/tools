'use client';
import { useState, useEffect } from 'react';

const CURRENCIES = {
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
};

const FALLBACK_USD = { INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.34, JPY: 149, AUD: 1.53, CAD: 1.36, CHF: 0.89, HKD: 7.82, SAR: 3.75, MYR: 4.72, THB: 35.1, CNY: 7.24, USD: 1 };

const QUICK_PAIRS = [
  { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'INR' },
  { from: 'GBP', to: 'INR' },
  { from: 'AED', to: 'INR' },
];
const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [rates, setRates] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchRates = async (base) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await res.json();
      if (data.result === 'success') {
        setRates(data.rates);
        setLastUpdated(data.time_last_update_utc);
        setUsingFallback(false);
      } else throw new Error('API error');
    } catch {
      setError('Could not fetch live rates. Showing approximate rates.');
      setUsingFallback(true);
      // Convert fallback to base currency
      const usdToBase = FALLBACK_USD[base] || 1;
      const converted = {};
      Object.keys(FALLBACK_USD).forEach(k => {
        converted[k] = FALLBACK_USD[k] / usdToBase;
      });
      setRates(converted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(from); }, [from]);

  const rate = rates[to] || 0;
  const converted = (parseFloat(amount) || 0) * rate;
  const reverseRate = rate ? (1 / rate) : 0;

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  const fmt = (n, decimals = 2) => {
    if (n >= 1000 || n === 0) return n.toLocaleString('en-IN', { maximumFractionDigits: decimals });
    return n.toFixed(Math.max(decimals, n < 0.01 ? 6 : 4));
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">{error}</div>
      )}

      {/* Quick pairs */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PAIRS.map(p => (
          <button key={p.from + p.to}
            onClick={() => { setFrom(p.from); setTo(p.to); }}
            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${from === p.from && to === p.to ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
            {p.from} → {p.to}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-lg font-medium"
            min="0"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 bg-white">
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code}>{c.flag} {code} – {c.name}</option>
              ))}
            </select>
          </div>

          <button onClick={swap}
            className="mb-0.5 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center text-lg transition-colors shrink-0">
            ⇄
          </button>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 bg-white">
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code}>{c.flag} {code} – {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
            <span className="animate-spin border-2 border-indigo-600 border-t-transparent rounded-full w-4 h-4 inline-block" />
            Fetching live rates…
          </div>
        ) : rate ? (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-2">
            <p className="text-3xl font-bold text-slate-900">
              {CURRENCIES[to].symbol}{fmt(converted)} <span className="text-slate-500 text-xl font-medium">{to}</span>
            </p>
            <p className="text-sm text-slate-500">
              {amount} {from} = {CURRENCIES[to].symbol}{fmt(converted)} {to}
            </p>
            <p className="text-xs text-slate-400">
              1 {from} = {fmt(rate, 4)} {to} &nbsp;·&nbsp; 1 {to} = {fmt(reverseRate, 4)} {from}
            </p>
            {lastUpdated && !usingFallback && (
              <p className="text-xs text-slate-400">Live rate · Updated {new Date(lastUpdated).toLocaleDateString()}</p>
            )}
            {usingFallback && <p className="text-xs text-amber-600">⚠ Approximate rates (offline)</p>}
          </div>
        ) : null}
      </div>

      {/* Quick conversion table */}
      {rate > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Quick Conversion Table</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-medium">{from}</th>
                  <th className="text-right py-2 text-slate-500 font-medium">{to}</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_AMOUNTS.map(a => (
                  <tr key={a} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-2 text-slate-700">{CURRENCIES[from].symbol}{a.toLocaleString()}</td>
                    <td className="py-2 text-right font-medium text-slate-900">{CURRENCIES[to].symbol}{fmt(a * rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
