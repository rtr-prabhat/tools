'use client';
import { useState } from 'react';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function calcHRA(basic, hraReceived, rentPaid, isMetro) {
  const actualHRA = parseFloat(hraReceived);
  const rentExcess = Math.max(0, parseFloat(rentPaid) - 0.1 * parseFloat(basic));
  const percentageBasic = isMetro ? 0.5 : 0.4;
  const basicPercent = parseFloat(basic) * percentageBasic;
  const exemptHRA = Math.min(actualHRA, rentExcess, basicPercent);
  const taxableHRA = actualHRA - exemptHRA;
  return {
    actualHRA,
    condition1: actualHRA,
    condition2: basicPercent,
    condition3: rentExcess,
    exemptHRA,
    taxableHRA,
  };
}

export default function HraCalculator() {
  const [basicSalary, setBasicSalary] = useState('');
  const [hraReceived, setHraReceived] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  const [cityType, setCityType] = useState('metro');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const b = parseFloat(basicSalary);
    const h = parseFloat(hraReceived);
    const r = parseFloat(rentPaid);
    if (!b || !h || !r) return;
    setResult(calcHRA(b, h, r, cityType === 'metro'));
  };

  const inp = 'border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base';
  const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
        📍 HRA exemption = <strong>minimum</strong> of 3 conditions under Section 10(13A). Enter <strong>monthly</strong> figures from your salary slip.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className={lbl}>Basic Salary (per month, ₹)</label>
          <input type="number" value={basicSalary} onChange={e => { setBasicSalary(e.target.value); setResult(null); }}
            placeholder="e.g. 50000" className={inp} />
        </div>

        <div>
          <label className={lbl}>HRA Received from Employer (per month, ₹)</label>
          <input type="number" value={hraReceived} onChange={e => { setHraReceived(e.target.value); setResult(null); }}
            placeholder="e.g. 20000" className={inp} />
        </div>

        <div>
          <label className={lbl}>Actual Rent Paid (per month, ₹)</label>
          <input type="number" value={rentPaid} onChange={e => { setRentPaid(e.target.value); setResult(null); }}
            placeholder="e.g. 18000" className={inp} />
        </div>

        <div>
          <label className={lbl}>City Type</label>
          <div className="flex gap-2">
            {[
              { id: 'metro', label: 'Metro (50%)', sub: 'Delhi, Mumbai, Chennai, Kolkata' },
              { id: 'non-metro', label: 'Non-Metro (40%)', sub: 'All other cities' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => { setCityType(opt.id); setResult(null); }}
                className={`flex-1 text-left rounded-xl border-2 px-4 py-3 transition-all ${cityType === opt.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className={`text-sm font-medium ${cityType === opt.id ? 'text-indigo-700' : 'text-slate-700'}`}>{opt.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={calculate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full">
          Calculate HRA Exemption
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* 3 conditions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">HRA Exemption — 3 Conditions</h3>
            <div className="space-y-3">
              {[
                { label: 'Condition 1: Actual HRA received', value: result.condition1 },
                { label: `Condition 2: ${cityType === 'metro' ? '50%' : '40%'} of Basic Salary`, value: result.condition2 },
                { label: 'Condition 3: Rent paid − 10% of Basic', value: result.condition3 },
              ].map((c, i) => {
                const isMin = c.value === result.exemptHRA;
                return (
                  <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${isMin ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                    <span className={`text-sm ${isMin ? 'text-green-800 font-medium' : 'text-slate-600'}`}>
                      {isMin && '✓ Minimum → '}{c.label}
                    </span>
                    <span className={`font-bold ${isMin ? 'text-green-700' : 'text-slate-700'}`}>{fmtINR(c.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-green-700">{fmtINR(result.exemptHRA)}</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Exempt HRA / month</div>
              <div className="text-xs text-green-500 mt-0.5">{fmtINR(result.exemptHRA * 12)} per year</div>
            </div>
            <div className={`rounded-2xl p-5 text-center ${result.taxableHRA > 0 ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className={`text-2xl font-bold ${result.taxableHRA > 0 ? 'text-red-600' : 'text-slate-400'}`}>{fmtINR(result.taxableHRA)}</div>
              <div className={`text-xs mt-1 font-medium ${result.taxableHRA > 0 ? 'text-red-500' : 'text-slate-400'}`}>Taxable HRA / month</div>
              <div className={`text-xs mt-0.5 ${result.taxableHRA > 0 ? 'text-red-400' : 'text-slate-400'}`}>{fmtINR(result.taxableHRA * 12)} per year</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            📝 <strong>Tip:</strong> You can claim exempt HRA under Sec. 10(13A) while filing ITR. Keep rent receipts. If annual rent exceeds ₹1,00,000, provide landlord's PAN to your employer.
            {result.taxableHRA === 0 && <span className="block mt-1 text-green-700 font-medium">🎉 Your full HRA is exempt — no HRA will be added to taxable income.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
