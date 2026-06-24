'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function calcEMI(P, rAnnual, nMonths) {
  const r = rAnnual / 12 / 100;
  if (r === 0) return P / nMonths;
  return P * r * Math.pow(1 + r, nMonths) / (Math.pow(1 + r, nMonths) - 1);
}

function buildSchedule(P, rAnnual, nMonths, emi) {
  const r = rAnnual / 12 / 100;
  const rows = [];
  let balance = P;
  for (let i = 1; i <= Math.min(nMonths, 12); i++) {
    const interest = balance * r;
    const principal = emi - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: i, emi, principal, interest, balance });
  }
  return rows;
}

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(tenure);
    if (!P || !r || !t) return;
    const n = tenureType === 'years' ? t * 12 : t;
    const emi = calcEMI(P, r, n);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;
    const schedule = buildSchedule(P, r, n, emi);
    setResult({ emi, totalPayable, totalInterest, schedule, n });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Loan Amount (₹)</label>
          <input type="number" value={principal} onChange={e => { setPrincipal(e.target.value); setResult(null); }}
            placeholder="e.g. 1000000" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => { setRate(e.target.value); setResult(null); }}
            placeholder="e.g. 8.5" step="0.1" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenure</label>
          <div className="flex gap-2">
            <input type="number" value={tenure} onChange={e => { setTenure(e.target.value); setResult(null); }}
              placeholder={tenureType === 'years' ? 'e.g. 20' : 'e.g. 240'}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 text-slate-900 text-base" />
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              {['years', 'months'].map(t => (
                <button key={t} onClick={() => { setTenureType(t); setResult(null); }}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${tenureType === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={calculate} disabled={!principal || !rate || !tenure}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full text-base mt-4 disabled:opacity-50">
          Calculate EMI
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-700">{fmtINR(Math.round(result.emi))}</p>
                <p className="text-sm text-slate-500 mt-1">Monthly EMI</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-600">{fmtINR(Math.round(result.totalInterest))}</p>
                <p className="text-sm text-slate-500 mt-1">Total Interest</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{fmtINR(Math.round(result.totalPayable))}</p>
                <p className="text-sm text-slate-500 mt-1">Total Payable</p>
              </div>
            </div>

            {/* Principal vs Interest bar */}
            <div className="mt-5">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 transition-all"
                  style={{ width: `${(parseFloat(principal) / result.totalPayable) * 100}%` }}
                />
                <div className="bg-rose-400 flex-1" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                <span>● Principal: {fmtINR(Math.round(parseFloat(principal)))}</span>
                <span>● Interest: {fmtINR(Math.round(result.totalInterest))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Amortization Schedule
              {result.n > 12 && <span className="text-xs font-normal text-slate-400 ml-2">Showing first 12 of {result.n} months</span>}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map(row => (
                    <tr key={row.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-2 text-slate-600">{row.month}</td>
                      <td className="py-2 px-2 text-slate-700">{fmtINR(Math.round(row.emi))}</td>
                      <td className="py-2 px-2 text-indigo-600">{fmtINR(Math.round(row.principal))}</td>
                      <td className="py-2 px-2 text-rose-500">{fmtINR(Math.round(row.interest))}</td>
                      <td className="py-2 px-2 text-slate-700">{fmtINR(Math.round(row.balance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
