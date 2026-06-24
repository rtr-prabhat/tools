'use client';
import { useState, useEffect, useRef } from 'react';

const MODE_CONFIG = {
  work: { label: 'Work', color: '#6366f1', bg: 'bg-indigo-600' },
  'short-break': { label: 'Short Break', color: '#22c55e', bg: 'bg-green-500' },
  'long-break': { label: 'Long Break', color: '#0d9488', bg: 'bg-teal-500' },
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.stop(ctx.currentTime + 0.6);
  } catch (_) {}
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work');
  const [customTimes, setCustomTimes] = useState({ work: 25, 'short-break': 5, 'long-break': 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tempTimes, setTempTimes] = useState({ work: 25, 'short-break': 5, 'long-break': 15 });
  const sessionCountRef = useRef(0);
  const intervalRef = useRef(null);

  const totalTime = customTimes[mode] * 60;
  const progress = (totalTime - timeLeft) / totalTime;
  const r = 90;
  const circ = 2 * Math.PI * r;
  const dash = progress * circ;
  const modeColor = MODE_CONFIG[mode].color;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            playBeep();
            handleModeComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const handleModeComplete = () => {
    setIsRunning(false);
    if (mode === 'work') {
      sessionCountRef.current += 1;
      setSessions(sessionCountRef.current);
      const next = sessionCountRef.current % 4 === 0 ? 'long-break' : 'short-break';
      switchMode(next);
    } else {
      switchMode('work');
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(customTimes[newMode] * 60);
  };

  const handleModeTab = (m) => {
    if (!isRunning) switchMode(m);
  };

  const togglePlay = () => setIsRunning(r => !r);

  const reset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(customTimes[mode] * 60);
  };

  const saveSettings = () => {
    setCustomTimes({ ...tempTimes });
    setTimeLeft(tempTimes[mode] * 60);
    setIsRunning(false);
    setShowSettings(false);
  };

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex gap-1">
        {Object.entries(MODE_CONFIG).map(([m, cfg]) => (
          <button key={m} onClick={() => handleModeTab(m)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${mode === m ? `text-white` : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ background: mode === m ? cfg.color : 'transparent' }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center gap-4">
        <svg width={220} height={220} viewBox="0 0 220 220">
          <circle cx={110} cy={110} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />
          <circle cx={110} cy={110} r={r} fill="none" stroke={modeColor} strokeWidth={12}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          <text x={110} y={100} textAnchor="middle" fontSize={38} fontWeight="700" fill={modeColor} fontFamily="monospace">{fmt(timeLeft)}</text>
          <text x={110} y={128} textAnchor="middle" fontSize={13} fill="#94a3b8">{MODE_CONFIG[mode].label}</text>
        </svg>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-lg flex items-center justify-center">
            ↺
          </button>
          <button onClick={togglePlay}
            className="w-16 h-16 rounded-full text-white text-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: modeColor }}>
            {isRunning ? '⏸' : '▶'}
          </button>
          <button onClick={() => { setShowSettings(!showSettings); setTempTimes({ ...customTimes }); }}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-lg flex items-center justify-center">
            ⚙
          </button>
        </div>

        {/* Session counter */}
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <span>🍅</span>
          <span>×</span>
          <span className="font-semibold text-slate-700">{sessions}</span>
          <span>sessions completed</span>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-800">⚙️ Settings</h3>
          {[
            { key: 'work', label: 'Work Duration (min)', min: 5, max: 90 },
            { key: 'short-break', label: 'Short Break (min)', min: 1, max: 30 },
            { key: 'long-break', label: 'Long Break (min)', min: 5, max: 60 },
          ].map(({ key, label, min, max }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <span className="text-sm font-semibold text-indigo-600">{tempTimes[key]} min</span>
              </div>
              <input type="range" min={min} max={max} value={tempTimes[key]}
                onChange={e => setTempTimes(t => ({ ...t, [key]: parseInt(e.target.value) }))}
                className="w-full accent-indigo-600" />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={saveSettings}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 font-medium transition-colors">
              Save Settings
            </button>
            <button onClick={() => setShowSettings(false)}
              className="px-5 py-2.5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700 border border-indigo-100">
        <strong>Pomodoro Technique:</strong> Work for {customTimes.work} min → short break {customTimes['short-break']} min → after 4 sessions take a long break of {customTimes['long-break']} min.
      </div>
    </div>
  );
}
