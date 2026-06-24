'use client';
import { useState, useEffect, useRef } from 'react';

const SAMPLES = [
  { label: 'Pangram', text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.' },
  { label: 'Hello', text: 'Hello! Welcome to ToolKit Pro. This text-to-speech tool uses your browser\'s built-in voice engine.' },
  { label: 'Business', text: 'Good morning. This is to inform you that your quarterly report has been reviewed and approved. Please proceed with the final submission at your earliest convenience.' },
  { label: 'Quote', text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle.' },
];

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const uttRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0]);
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = () => {
    if (!text.trim() || !supported) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utt.voice = selectedVoice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = volume;
    utt.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utt.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utt.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsSpeaking(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="font-medium">Your browser does not support the Web Speech API.</p>
        <p className="text-sm mt-1">Please try Chrome, Edge, or Safari for text-to-speech functionality.</p>
      </div>
    );
  }

  const Slider = ({ label, value, min, max, step, onChange }) => (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600">{value}x</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-600" />
      <div className="flex justify-between text-xs text-slate-400 mt-0.5">
        <span>{min}x</span><span>{max}x</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Text input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-slate-700">Text to Speak</label>
          <span className={`text-xs ${text.length > 4500 ? 'text-red-500' : 'text-slate-400'}`}>{text.length} / 5000</span>
        </div>
        <textarea rows={6} value={text} maxLength={5000}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste text here to hear it spoken aloud…"
          className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 resize-none text-sm"
        />
        {/* Sample buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-slate-400 self-center">Quick samples:</span>
          {SAMPLES.map(s => (
            <button key={s.label} onClick={() => setText(s.text)}
              className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-800">Voice Settings</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Voice</label>
          <select value={selectedVoice?.name || ''} onChange={e => setSelectedVoice(voices.find(v => v.name === e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-sm bg-white">
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
            {voices.length === 0 && <option>Loading voices…</option>}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Slider label="Speed" value={rate} min={0.5} max={2} step={0.1} onChange={setRate} />
          <Slider label="Pitch" value={pitch} min={0.5} max={2} step={0.1} onChange={setPitch} />
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Volume</label>
              <span className="text-sm font-semibold text-indigo-600">{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.1} value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button onClick={speak} disabled={!text.trim() || isSpeaking}
          className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          ▶ Speak
        </button>
        <button onClick={pause} disabled={!isSpeaking}
          className="flex-1 min-w-[120px] bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          ⏸ Pause
        </button>
        <button onClick={resume} disabled={!isPaused}
          className="flex-1 min-w-[120px] bg-white hover:bg-green-50 text-green-700 border-2 border-green-500 rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          ▶ Resume
        </button>
        <button onClick={stop} disabled={!isSpeaking && !isPaused}
          className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          ⏹ Stop
        </button>
      </div>

      {/* Status */}
      {isSpeaking && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Speaking… at {rate}x speed</span>
        </div>
      )}
      {isPaused && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-sm font-medium">Paused — click Resume to continue</span>
        </div>
      )}
    </div>
  );
}
