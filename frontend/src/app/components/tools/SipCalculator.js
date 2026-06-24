'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function calcSIP(P, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return P * n;
  return P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export default function SipCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [returnRate, setReturnRate] = useState('12');
  const [years, setYears] = useState(10);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(monthlyAmount);
    const r = parseFloat(returnRate);
    const y = parseInt(years);
    if (!P || !r || !y) return;

    const invested = P * y * 12;
    const totalValue = calcSIP(P, r, y);
    const returns = totalValue - invested;

    const yearWise = [];
    for (let yr = 1; yr <= y; yr++) {
      const val = calcSIP(P, r, yr);
      yearWise.push({ year: yr, invested: P * yr * 12, value: val });
    }

    setResult({ invested, totalValue, returns, yearWise });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly SIP Amount (₹)</label>
          <input type="number" value={monthlyAmount} onChange={e => { setMonthlyAmount(e.target.value); setResult(null); }}
            placeholder="e.g. 5000" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Annual Return (%)</label>
          <input type="number" value={returnRate} onChange={e => { setReturnRate(e.target.value); setResult(null); }}
            placeholder="e.g. 12" step="0.5" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Investment Period</label>
            <span className="text-sm font-semibold text-indigo-600">{years} years</span>
          </div>
          <input type="range" min="1" max="30" value={years} onChange={e => { setYears(Number(e.target.value)); setResult(null); }}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1 yr</span><span>30 yrs</span></div>
        </div>
        <button onClick={calculate} disabled={!monthlyAmount || !returnRate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full text-base mt-4 disabled:opacity-50">
          Calculate Returns
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-700">{fmtINR(Math.round(result.invested))}</p>
                <p className="text-sm text-slate-500 mt-1">Amount Invested</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{fmtINR(Math.round(result.returns))}</p>
                <p className="text-sm text-slate-500 mt-1">Est. Returns</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{fmtINR(Math.round(result.totalValue))}</p>
                <p className="text-sm text-slate-500 mt-1">Total Value</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="bg-indigo-500" style={{ width: `${(result.invested / result.totalValue) * 100}%` }} />
                <div className="bg-green-400 flex-1" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                <span>● Invested</span>
                <span>● Returns ({((result.returns / result.invested) * 100).toFixed(0)}% gain)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Year-wise Growth</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-slate-500 uppercase">Year</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase">Invested</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase">Value</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.yearWise.length > 10
                    ? [...result.yearWise.slice(0, 10), result.yearWise[result.yearWise.length - 1]]
                    : result.yearWise
                  ).map((row, i, arr) => (
                    <tr key={row.year} className={`border-b border-slate-50 hover:bg-slate-50 ${i === arr.length - 1 && result.yearWise.length > 10 ? 'font-semibold bg-indigo-50/50' : ''}`}>
                      <td className="py-2 px-2 text-slate-600">{row.year} {i === arr.length - 1 && result.yearWise.length > 10 ? '(final)' : ''}</td>
                      <td className="py-2 px-2 text-right text-slate-600">{fmtINR(Math.round(row.invested))}</td>
                      <td className="py-2 px-2 text-right text-indigo-600">{fmtINR(Math.round(row.value))}</td>
                      <td className="py-2 px-2 text-right text-green-600">+{fmtINR(Math.round(row.value - row.invested))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">⚠ Returns are estimated. Actual mutual fund returns vary based on market conditions.</p>
          </div>
        </div>
      )}
    </div>
  );
}
