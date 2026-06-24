'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function calcPPF(yearly, rate, years) {
  const r = parseFloat(rate) / 100;
  const rows = [];
  let openingBalance = 0;
  for (let y = 1; y <= years; y++) {
    const interest = (openingBalance + parseFloat(yearly)) * r;
    const closingBalance = openingBalance + parseFloat(yearly) + interest;
    rows.push({ year: y, opening: openingBalance, invested: parseFloat(yearly), interest, closing: closingBalance });
    openingBalance = closingBalance;
  }
  const totalInvested = parseFloat(yearly) * years;
  const maturity = rows[rows.length - 1].closing;
  const totalInterest = maturity - totalInvested;
  return { rows, totalInvested, totalInterest, maturity };
}

export default function PpfCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState('');
  const [rate, setRate] = useState('7.1');
  const [years, setYears] = useState('15');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const y = parseFloat(yearlyInvestment);
    if (!y || y < 500 || y > 150000) return;
    setResult(calcPPF(y, rate, parseInt(years)));
  };

  const inp = 'border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base';
  const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm text-indigo-800">
        🏛️ PPF is a <strong>government-backed, tax-free</strong> savings scheme. Contributions qualify for Section 80C deduction.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className={lbl}>Yearly Investment (₹500 – ₹1,50,000)</label>
          <input type="number" value={yearlyInvestment} onChange={e => { setYearlyInvestment(e.target.value); setResult(null); }}
            placeholder="e.g. 150000" min="500" max="150000" className={inp} />
        </div>

        <div>
          <label className={lbl}>Rate of Interest (% p.a.) — Current: 7.1%</label>
          <input type="number" value={rate} onChange={e => { setRate(e.target.value); setResult(null); }}
            step="0.1" min="1" max="15" className={inp} />
        </div>

        <div>
          <label className={lbl}>Investment Period: <strong>{years} years</strong></label>
          <input type="range" min="5" max="30" value={years}
            onChange={e => { setYears(e.target.value); setResult(null); }}
            className="w-full accent-indigo-600 mt-1" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5 years</span><span>30 years</span></div>
        </div>

        <button onClick={calculate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full">
          Calculate Maturity Amount
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-slate-700">{fmtINR(result.totalInvested)}</div>
                <div className="text-xs text-slate-500 mt-1">Total Invested</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{fmtINR(result.totalInterest)}</div>
                <div className="text-xs text-slate-500 mt-1">Interest Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700">{fmtINR(result.maturity)}</div>
                <div className="text-xs text-slate-500 mt-1">Maturity Amount</div>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-2">
              <div className="flex rounded-full overflow-hidden h-3">
                <div className="bg-indigo-400" style={{ width: `${(result.totalInvested / result.maturity * 100).toFixed(1)}%` }} />
                <div className="bg-green-400 flex-1" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Principal {(result.totalInvested / result.maturity * 100).toFixed(0)}%</span>
                <span>Interest {(result.totalInterest / result.maturity * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            🎯 <strong>Tax Benefits (EEE Status):</strong> Investments qualify for 80C (up to ₹1.5L/yr). Interest earned and maturity amount are <strong>completely tax-free</strong>.
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Year-wise Breakdown</h3>
              <span className="text-xs text-slate-400">{result.rows.length} years</span>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    {['Year','Opening','Invested','Interest','Closing'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(row => (
                    <tr key={row.year} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2 font-medium text-indigo-600">{row.year}</td>
                      <td className="py-2 px-2 text-slate-600">{fmtINR(row.opening)}</td>
                      <td className="py-2 px-2 text-slate-600">{fmtINR(row.invested)}</td>
                      <td className="py-2 px-2 text-green-600">{fmtINR(row.interest)}</td>
                      <td className="py-2 px-2 font-semibold text-slate-900">{fmtINR(row.closing)}</td>
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
