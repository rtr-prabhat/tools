'use client';

import { useToolState } from '../context/ToolStateContext';

export default function ToolPreviewPanel({ toolId, tool, content }) {
  const { state } = useToolState();

  // Color converter preview — reads from shared context
  const ColorPreview = () => {
    const hex = state.colorHex || '#6366f1';
    const r = state.colorR ?? 99;
    const g = state.colorG ?? 102;
    const b = state.colorB ?? 241;

    const getLuminance = (rr, gg, bb) => {
      const [r2, g2, b2] = [rr, gg, bb].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
    };

    const lum = getLuminance(r, g, b);
    const textColor = lum > 0.179 ? '#1e293b' : '#ffffff';
    const hslH = Math.round(lum * 360);

    return (
      <div className="space-y-2 text-center">
        <div className="h-16 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors" style={{ backgroundColor: hex, color: textColor }}>
          {hex.toUpperCase()}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: hex }} />
          <span className="text-xs text-slate-400">Real-time color preview</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-500">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-1 truncate">HEX {hex}</div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-1 truncate">RGB {r},{g},{b}</div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-1 truncate">HSL {hslH}°</div>
        </div>
      </div>
    );
  };

  // Password preview — reads from shared context
  const PasswordPreview = () => {
    const password = state.password || '';
    const strength = state.passwordStrength || { label: 'Generating...', color: 'bg-slate-300', width: '0%' };
    const length = state.passwordLength || 16;

    return (
      <div className="space-y-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all tracking-wider">
            {password ? password.replace(/./g, '•') : 'Click generate'}
          </p>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Strength</span><span className="font-medium text-indigo-600">{strength.label}</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
          </div>
        </div>
        <div className="flex justify-center gap-2 text-[10px] text-slate-400">
          <span>🔤 {length} chars</span>
          <span>🔒 Secure</span>
        </div>
      </div>
    );
  };

  // Unit converter preview — reads from shared context
  const UnitPreview = () => {
    const value = state.unitValue ?? '1000';
    const fromUnit = state.unitFrom || 'm';
    const toUnit = state.unitTo || 'km';
    const result = state.unitResult ?? '1';

    return (
      <div className="space-y-2 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
          <p className="text-[10px] text-slate-400 mb-0.5">{value} {fromUnit} =</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{toUnit}</p>
        </div>
      </div>
    );
  };

  // BMI preview — reads from shared context
  const BmiPreview = () => {
    const bmi = state.bmiResult;
    const weight = state.bmiWeight || '';
    const height = state.bmiHeight || '';

    if (!bmi && !weight && !height) {
      return (
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Enter your weight and height in the tool to see BMI preview</p>
        </div>
      );
    }

    const catColor = bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#22c55e' : bmi < 30 ? '#eab308' : '#ef4444';
    const catLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

    return (
      <div className="space-y-2 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
          <p className="text-2xl font-extrabold" style={{ color: catColor }}>{bmi}</p>
          <p className="text-xs font-medium" style={{ color: catColor }}>{catLabel}</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden flex">
          <div className="w-[19%] bg-blue-400" /><div className="w-[33%] bg-green-400" /><div className="w-[23%] bg-yellow-400" /><div className="w-[13%] bg-orange-400" /><div className="flex-1 bg-red-400" />
        </div>
      </div>
    );
  };

  // Age calculator preview
  const AgePreview = () => {
    const years = state.ageYears;
    const months = state.ageMonths;
    const days = state.ageDays;

    if (years === undefined) {
      return (
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Select your date of birth to see age preview</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
          <p className="text-xs text-slate-400 mb-0.5">Your Age</p>
          <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{years}y {months}m {days}d</p>
        </div>
      </div>
    );
  };

  // QR code preview placeholder
  const QrPreview = () => {
    const qrDataUrl = state.qrDataUrl;
    return (
      <div className="space-y-2 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 mx-auto rounded-lg" />
          ) : (
            <div className="w-28 h-28 mx-auto flex items-center justify-center text-5xl opacity-40">📱</div>
          )}
        </div>
        <p className="text-[10px] text-slate-400">{qrDataUrl ? 'Generated QR Code' : 'Generate a QR code using the tool'}</p>
      </div>
    );
  };

  // Watermark preview placeholder
  const WatermarkPreview = () => {
    const resultUrl = state.watermarkResult;
    return (
      <div className="space-y-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-dashed border-slate-200 dark:border-slate-700">
          {resultUrl ? (
            <div className="w-full h-20 flex items-center justify-center text-green-500 text-sm font-medium">
              ✅ Watermarked image ready
            </div>
          ) : (
            <div className="w-full h-20 flex items-center justify-center text-4xl opacity-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
              🔏
            </div>
          )}
        </div>
        <p className="text-[10px] text-slate-400">{resultUrl ? 'Download from the tool' : 'Upload an image and add watermark'}</p>
      </div>
    );
  };

  // Render preview based on toolId
  const renderPreview = () => {
    switch (toolId) {
      case 'color-converter': return <ColorPreview />;
      case 'password-generator': return <PasswordPreview />;
      case 'unit-converter': return <UnitPreview />;
      case 'bmi-calculator': return <BmiPreview />;
      case 'age-calculator': return <AgePreview />;
      case 'qr-generator': return <QrPreview />;
      case 'watermark-adder': return <WatermarkPreview />;
      default: return null;
    }
  };

  const preview = renderPreview();
  if (!preview) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Preview</span>
      </div>
      {preview}
    </div>
  );
}
