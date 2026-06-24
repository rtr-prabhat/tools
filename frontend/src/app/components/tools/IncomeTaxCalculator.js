'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function calcNewRegime(grossIncome) {
  const taxableIncome = Math.max(0, grossIncome - 75000);
  const slabs = [[300000,0],[400000,0.05],[300000,0.10],[200000,0.15],[300000,0.20],[Infinity,0.30]];
  let tax = 0, remaining = taxableIncome;
  const slabBreakdown = [];
  for (const [size, rate] of slabs) {
    const taxable = Math.min(remaining, size);
    const slabTax = taxable * rate;
    if (taxable > 0) slabBreakdown.push({ range: size, taxable, rate, tax: slabTax });
    tax += slabTax;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  if (taxableIncome <= 700000) tax = 0;
  const cess = tax * 0.04;
  return { taxableIncome, tax, cess, total: tax + cess, slabBreakdown };
}

function calcOldRegime(grossIncome, d80C, d80D, hraExempt, otherDed) {
  const stdDeduction = 50000;
  const totalDeductions = stdDeduction + Math.min(150000, d80C) + Math.min(25000, d80D) + hraExempt + otherDed;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const slabs = [[250000,0],[250000,0.05],[500000,0.20],[Infinity,0.30]];
  let tax = 0, remaining = taxableIncome;
  const slabBreakdown = [];
  for (const [size, rate] of slabs) {
    const taxable = Math.min(remaining, size);
    const slabTax = taxable * rate;
    if (taxable > 0) slabBreakdown.push({ taxable, rate, tax: slabTax });
    tax += slabTax;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  if (taxableIncome <= 500000) tax = Math.max(0, tax - 12500);
  const cess = tax * 0.04;
  return { taxableIncome, tax, cess, total: tax + cess, totalDeductions, slabBreakdown };
}

function RegimeCard({ label, data, isBetter, recommended }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl p-5 border-2 transition-all ${isBetter ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-bold text-slate-900 text-base">{label}</span>
          {recommended && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">Default FY25</span>}
        </div>
        {isBetter && <span className="text-xs bg-green-600 text-white rounded-full px-2 py-0.5 font-medium">✓ Better for you</span>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600"><span>Taxable Income</span><span className="font-medium text-slate-900">{fmtINR(data.taxableIncome)}</span></div>
        <div className="flex justify-between text-slate-600"><span>Income Tax</span><span className="font-medium text-slate-900">{fmtINR(data.tax)}</span></div>
        <div className="flex justify-between text-slate-600"><span>Health & Ed. Cess (4%)</span><span className="font-medium text-slate-900">{fmtINR(data.cess)}</span></div>
        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900"><span>Total Tax</span><span className={isBetter ? 'text-green-700' : ''}>{fmtINR(data.total)}</span></div>
      </div>
      {data.slabBreakdown?.length > 0 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          {expanded ? '▲ Hide' : '▼ Show'} slab breakdown
        </button>
      )}
      {expanded && (
        <div className="mt-2 text-xs space-y-1">
          {data.slabBreakdown.map((s, i) => (
            <div key={i} className="flex justify-between text-slate-500">
              <span>{fmtINR(s.taxable)} @ {(s.rate * 100).toFixed(0)}%</span>
              <span>{fmtINR(s.tax)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IncomeTaxCalculator() {
  const [grossIncome, setGrossIncome] = useState('');
  const [deductions80C, setDeductions80C] = useState('');
  const [deductions80D, setDeductions80D] = useState('');
  const [hraExempt, setHraExempt] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [result, setResult] = useState(null);
  const [showOldInputs, setShowOldInputs] = useState(false);

  const calculate = () => {
    const g = parseFloat(grossIncome) || 0;
    if (!g) return;
    const newR = calcNewRegime(g);
    const oldR = calcOldRegime(g, parseFloat(deductions80C)||0, parseFloat(deductions80D)||0, parseFloat(hraExempt)||0, parseFloat(otherDeductions)||0);
    setResult({ newR, oldR });
  };

  const inp = 'border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base';
  const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        📋 <strong>FY 2024-25</strong> (AY 2025-26) — New Regime is default. Old regime must be opted in explicitly.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className={lbl}>Gross Annual Income (₹) <span className="text-red-500">*</span></label>
          <input type="number" value={grossIncome} onChange={e => { setGrossIncome(e.target.value); setResult(null); }}
            placeholder="e.g. 1200000" className={inp} />
          <p className="text-xs text-slate-400 mt-1">Include salary, freelance income, rent income, etc.</p>
        </div>

        <button
          onClick={() => setShowOldInputs(v => !v)}
          className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
        >
          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${showOldInputs ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400'}`}>
            {showOldInputs && <span className="text-white text-xs">✓</span>}
          </span>
          Add deductions for Old Regime comparison
        </button>

        {showOldInputs && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Old Regime Deductions</p>
            <div>
              <label className={lbl}>Section 80C — PPF, ELSS, LIC, PF (max ₹1,50,000)</label>
              <input type="number" value={deductions80C} onChange={e => setDeductions80C(e.target.value)} placeholder="e.g. 150000" className={inp} />
            </div>
            <div>
              <label className={lbl}>Section 80D — Health Insurance (max ₹25,000)</label>
              <input type="number" value={deductions80D} onChange={e => setDeductions80D(e.target.value)} placeholder="e.g. 25000" className={inp} />
            </div>
            <div>
              <label className={lbl}>HRA Exemption (use HRA Calculator for exact figure)</label>
              <input type="number" value={hraExempt} onChange={e => setHraExempt(e.target.value)} placeholder="e.g. 120000" className={inp} />
            </div>
            <div>
              <label className={lbl}>Other Deductions (NPS 80CCD, home loan interest, etc.)</label>
              <input type="number" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} placeholder="e.g. 50000" className={inp} />
            </div>
          </div>
        )}

        <button onClick={calculate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full">
          Calculate Tax
        </button>
      </div>

      {result && (() => {
        const { newR, oldR } = result;
        const newIsBetter = newR.total <= oldR.total;
        const savings = Math.abs(oldR.total - newR.total);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RegimeCard label="New Regime" data={newR} isBetter={newIsBetter} recommended />
              <RegimeCard label="Old Regime" data={oldR} isBetter={!newIsBetter} />
            </div>

            {savings > 0 && (
              <div className={`rounded-xl p-4 text-sm font-medium ${newIsBetter ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                💡 You save <strong>{fmtINR(savings)}</strong> by choosing the <strong>{newIsBetter ? 'New' : 'Old'} Regime</strong>
                <span className="block text-xs font-normal mt-0.5 opacity-80">≈ {fmtINR(Math.round((newIsBetter ? newR.total : oldR.total) / 12))} per month TDS deduction</span>
              </div>
            )}
            {savings === 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                Both regimes result in the same tax liability for your income.
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">Indicative calculation. Consult a CA for accurate filing. Surcharge not included.</p>
          </div>
        );
      })()}
    </div>
  );
}
