'use client';
import { useState, useEffect } from 'react';
import { useToolState } from '../../context/ToolStateContext';

const CATEGORIES = [
  { max: 18.5, label: 'Underweight', color: '#3b82f6', bg: '#eff6ff', tip: 'Consider consulting a nutritionist. A balanced diet can help you reach a healthy weight.' },
  { max: 25, label: 'Normal weight', color: '#22c55e', bg: '#f0fdf4', tip: 'Great! Maintain your healthy weight with regular exercise and a balanced diet.' },
  { max: 30, label: 'Overweight', color: '#eab308', bg: '#fefce8', tip: 'Small lifestyle changes — like daily walks and reducing processed food — can make a big difference.' },
  { max: 35, label: 'Obese (Class I)', color: '#f97316', bg: '#fff7ed', tip: 'Consulting a doctor for a personalised weight management plan is advisable.' },
  { max: Infinity, label: 'Obese (Class II)', color: '#ef4444', bg: '#fef2f2', tip: 'Please consult a healthcare professional for guidance on weight management.' },
];

function getCategory(bmi) {
  return CATEGORIES.find(c => bmi < c.max);
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState(null);
  const { updateState } = useToolState();

  // Push BMI result to shared context for live preview
  useEffect(() => {
    updateState('bmiResult', result?.bmi?.toFixed(1) || null);
    updateState('bmiWeight', weight);
    updateState('bmiHeight', heightCm || heightFt);
  }, [result, weight, heightCm, heightFt, updateState]);

  const calculate = () => {
    let wKg, hM;
    if (unit === 'metric') {
      wKg = parseFloat(weight);
      hM = parseFloat(heightCm) / 100;
    } else {
      wKg = parseFloat(weight) * 0.453592;
      const totalIn = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      hM = totalIn * 0.0254;
    }
    if (!wKg || !hM) return;
    const bmi = wKg / (hM * hM);
    const category = getCategory(bmi);
    const minHealthy = 18.5 * hM * hM;
    const maxHealthy = 24.9 * hM * hM;
    setResult({ bmi, category, minHealthy, maxHealthy });
  };

  const bmiPct = result ? Math.min(((result.bmi - 10) / (45 - 10)) * 100, 100) : 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Unit toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {[{ val: 'metric', label: 'Metric (kg / cm)' }, { val: 'imperial', label: 'Imperial (lbs / ft)' }].map(opt => (
            <button key={opt.val} onClick={() => { setUnit(opt.val); setResult(null); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${unit === opt.val ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <input type="number" value={weight} onChange={e => { setWeight(e.target.value); setResult(null); }}
            placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
        </div>

        {/* Height */}
        {unit === 'metric' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Height (cm)</label>
            <input type="number" value={heightCm} onChange={e => { setHeightCm(e.target.value); setResult(null); }}
              placeholder="e.g. 175"
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Height</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input type="number" value={heightFt} onChange={e => { setHeightFt(e.target.value); setResult(null); }}
                  placeholder="Feet" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
                <span className="text-xs text-slate-400 block text-center mt-1">Feet</span>
              </div>
              <div className="flex-1">
                <input type="number" value={heightIn} onChange={e => { setHeightIn(e.target.value); setResult(null); }}
                  placeholder="Inches" min="0" max="11" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-base" />
                <span className="text-xs text-slate-400 block text-center mt-1">Inches</span>
              </div>
            </div>
          </div>
        )}

        <button onClick={calculate}
          disabled={!weight || (unit === 'metric' ? !heightCm : (!heightFt && !heightIn))}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full text-base mt-4 disabled:opacity-50">
          Calculate BMI
        </button>
      </div>

      {result && (
        <div className="rounded-2xl p-6 border" style={{ background: result.category.bg, borderColor: result.category.color + '33' }}>
          {/* Big BMI */}
          <div className="text-center mb-5">
            <p className="text-5xl font-extrabold" style={{ color: result.category.color }}>{result.bmi.toFixed(1)}</p>
            <p className="text-lg font-semibold mt-1" style={{ color: result.category.color }}>{result.category.label}</p>
          </div>

          {/* Visual bar */}
          <div className="mb-4">
            <div className="relative h-5 rounded-full overflow-hidden flex">
              <div className="flex-none w-[19%] bg-blue-400" title="Underweight" />
              <div className="flex-none w-[33%] bg-green-400" title="Normal" />
              <div className="flex-none w-[23%] bg-yellow-400" title="Overweight" />
              <div className="flex-none w-[13%] bg-orange-400" title="Obese I" />
              <div className="flex-1 bg-red-400" title="Obese II" />
            </div>
            {/* Marker */}
            <div className="relative h-2">
              <div className="absolute top-0 w-3 h-3 rounded-full border-2 border-white shadow-md -translate-x-1.5 -translate-y-1"
                style={{ left: `${bmiPct}%`, backgroundColor: result.category.color }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
              <span>Underweight<br/>&lt;18.5</span>
              <span className="text-center">Normal<br/>18.5–24.9</span>
              <span className="text-center">Overweight<br/>25–29.9</span>
              <span className="text-right">Obese<br/>30+</span>
            </div>
          </div>

          <div className="border-t pt-4 mt-2" style={{ borderColor: result.category.color + '33' }}>
            <p className="text-sm text-slate-700 mb-2">
              <span className="font-medium">Healthy weight range for your height:</span>{' '}
              {unit === 'metric'
                ? `${result.minHealthy.toFixed(1)} kg – ${result.maxHealthy.toFixed(1)} kg`
                : `${(result.minHealthy / 0.453592).toFixed(1)} lbs – ${(result.maxHealthy / 0.453592).toFixed(1)} lbs`}
            </p>
            <p className="text-sm text-slate-600">💡 {result.category.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
