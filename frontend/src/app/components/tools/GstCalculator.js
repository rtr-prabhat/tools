'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtINR2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [txType, setTxType] = useState('intra');
  const [direction, setDirection] = useState('add');
  const [result, setResult] = useState(null);

  const rates = [5, 12, 18, 28];

  const calculate = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    let base, gstAmt, total;
    if (direction === 'add') {
      base = val;
      gstAmt = val * (gstRate / 100);
      total = val + gstAmt;
    } else {
      total = val;
      base = val / (1 + gstRate / 100);
      gstAmt = total - base;
    }

    const effectiveRate = (gstAmt / total) * 100;
    const half = gstAmt / 2;

    setResult({ base, gstAmt, total, half, effectiveRate });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setResult(null); }}
            placeholder="Enter amount"
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base"
          />
        </div>

        {/* GST Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">GST Rate</label>
          <div className="flex gap-2">
            {rates.map(r => (
              <button
                key={r}
                onClick={() => { setGstRate(r); setResult(null); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border ${
                  gstRate === r
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Calculation Type</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {[
              { val: 'add', label: '+ Add GST to amount' },
              { val: 'remove', label: '− Remove GST from total' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => { setDirection(opt.val); setResult(null); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  direction === opt.val ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction Type</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {[
              { val: 'intra', label: 'Intra-state (CGST + SGST)' },
              { val: 'inter', label: 'Inter-state (IGST)' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => { setTxType(opt.val); setResult(null); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  txType === opt.val ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={calculate}
          disabled={!amount}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full text-base mt-4 disabled:opacity-50"
        >
          Calculate GST
        </button>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
          <h3 className="text-base font-semibold text-slate-800">GST Breakdown</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-3xl font-bold text-indigo-700">{fmtINR2(result.base)}</p>
              <p className="text-sm text-slate-500 mt-1">{direction === 'add' ? 'Base Amount (excl. GST)' : 'Base Amount (excl. GST)'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-3xl font-bold text-rose-600">{fmtINR2(result.gstAmt)}</p>
              <p className="text-sm text-slate-500 mt-1">Total GST @ {gstRate}%</p>
            </div>
          </div>

          {txType === 'intra' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="text-xl font-bold text-amber-600">{fmtINR2(result.half)}</p>
                <p className="text-sm text-slate-500 mt-1">CGST @ {gstRate / 2}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="text-xl font-bold text-amber-600">{fmtINR2(result.half)}</p>
                <p className="text-sm text-slate-500 mt-1">SGST @ {gstRate / 2}%</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-xl font-bold text-amber-600">{fmtINR2(result.gstAmt)}</p>
              <p className="text-sm text-slate-500 mt-1">IGST @ {gstRate}%</p>
            </div>
          )}

          <div className="border-t border-indigo-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Total Amount (incl. GST)</span>
              <span className="text-2xl font-bold text-indigo-700">{fmtINR2(result.total)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Effective GST rate on total: {result.effectiveRate.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
