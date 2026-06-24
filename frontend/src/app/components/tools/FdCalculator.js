'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const FREQ_MAP = { annually: 1, 'semi-annually': 2, quarterly: 4, monthly: 12 };

export default function FdCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('0');
  const [compounding, setCompounding] = useState('quarterly');
  const [result, setResult] = useState(null);

  const freqOptions = ['annually', 'semi-annually', 'quarterly', 'monthly'];

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years || 0) + parseFloat(months || 0) / 12;
    if (!P || !r || !t) return;

    const n = FREQ_MAP[compounding];
    const maturity = P * Math.pow(1 + r / n, n * t);
    const interest = maturity - P;
    const effectiveYield = (Math.pow(1 + r / n, n) - 1) * 100;

    const yearWise = [];
    const totalYears = Math.ceil(t);
    for (let y = 1; y <= totalYears; y++) {
      const tY = Math.min(y, t);
      const closing = P * Math.pow(1 + r / n, n * tY);
      const opening = y === 1 ? P : P * Math.pow(1 + r / n, n * (tY - Math.min(1, t - (y - 1))));
      const prevClosing = y === 1 ? P : P * Math.pow(1 + r / n, n * (y - 1));
      yearWise.push({ year: y, opening: prevClosing, interest: closing - prevClosing, closing });
    }

    setResult({ maturity, interest, effectiveYield, yearWise });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Principal Amount (₹)</label>
          <input type="number" value={principal} onChange={e => { setPrincipal(e.target.value); setResult(null); }}
            placeholder="e.g. 100000" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => { setRate(e.target.value); setResult(null); }}
            placeholder="e.g. 7.1" step="0.1" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenure</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input type="number" value={years} onChange={e => { setYears(e.target.value); setResult(null); }}
                placeholder="Years" min="0" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
              <span className="text-xs text-slate-400 mt-1 block text-center">Years</span>
            </div>
            <div className="flex-1">
              <input type="number" value={months} onChange={e => { setMonths(e.target.value); setResult(null); }}
                placeholder="Months" min="0" max="11" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
              <span className="text-xs text-slate-400 mt-1 block text-center">Months (0–11)</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Compounding Frequency</label>
          <div className="grid grid-cols-2 gap-2">
            {freqOptions.map(f => (
              <button key={f} onClick={() => { setCompounding(f); setResult(null); }}
                className={`py-2 rounded-xl text-sm font-medium capitalize transition-colors border ${
                  compounding === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <button onClick={calculate} disabled={!principal || !rate || (!years && !months)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full text-base mt-4 disabled:opacity-50">
          Calculate Maturity
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-700">{fmtINR(Math.round(result.maturity))}</p>
                <p className="text-sm text-slate-500 mt-1">Maturity Amount</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{fmtINR(Math.round(result.interest))}</p>
                <p className="text-sm text-slate-500 mt-1">Interest Earned</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">{result.effectiveYield.toFixed(2)}%</p>
                <p className="text-sm text-slate-500 mt-1">Effective Yield p.a.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Year-wise Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Year', 'Opening Balance', 'Interest', 'Closing Balance'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.yearWise.map(row => (
                    <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-2 text-slate-600">{row.year}</td>
                      <td className="py-2 px-2 text-slate-700">{fmtINR(Math.round(row.opening))}</td>
                      <td className="py-2 px-2 text-green-600">+{fmtINR(Math.round(row.interest))}</td>
                      <td className="py-2 px-2 font-medium text-indigo-700">{fmtINR(Math.round(row.closing))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              💡 Tip: Compare FD rates across banks. Most leading banks offer 6.5–7.5% p.a. for senior citizens.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
