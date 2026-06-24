'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog. Practice makes perfect when it comes to typing. The more you type, the faster and more accurate you will become over time.",
  "Technology has transformed the way we communicate and work in the modern world. Fast and accurate typing is an essential skill for anyone who uses a computer regularly.",
  "India is a land of diversity, culture, and innovation. From ancient traditions to modern technology, the country continues to evolve and inspire millions around the world.",
  "Good communication is the foundation of every successful relationship, whether personal or professional. Clear, concise writing begins with the ability to type quickly and accurately.",
  "The best investment you can make is in yourself. Learning new skills, reading books, and staying curious are the keys to personal and professional growth in life.",
];

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState(60);
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [gameState, setGameState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const textareaRef = useRef(null);
  const intervalRef = useRef(null);

  const pickText = useCallback(() => {
    setTargetText(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
  }, []);

  useEffect(() => { pickText(); }, [pickText]);

  useEffect(() => {
    if (gameState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameState]);

  const startTest = () => {
    setTypedText('');
    setTimeLeft(duration);
    setStartTime(Date.now());
    setGameState('running');
    pickText();
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleType = (e) => {
    if (gameState !== 'running') return;
    const val = e.target.value;
    if (val.length > targetText.length) return;
    setTypedText(val);
    if (val === targetText) {
      clearInterval(intervalRef.current);
      setGameState('finished');
    }
  };

  const elapsed = startTime ? Math.max(1, (duration - timeLeft)) : 1;
  const wordCount = typedText.trim().split(/\s+/).filter(w => w).length;
  const wpm = gameState !== 'idle' ? Math.round(wordCount / (elapsed / 60)) : 0;

  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) correctChars++;
  }
  const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
  const errors = typedText.length - correctChars;

  const timerColor = timeLeft <= 10 ? 'text-red-600' : timeLeft <= 20 ? 'text-amber-600' : 'text-slate-800';

  return (
    <div className="space-y-5">
      {gameState === 'idle' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Select Duration</h3>
            <p className="text-sm text-slate-500 mt-1">How long do you want to test?</p>
          </div>
          <div className="flex justify-center gap-3">
            {[30, 60, 120].map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm border transition-colors ${duration === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}>
                {d < 60 ? `${d}s` : `${d / 60} min`}
              </button>
            ))}
          </div>
          <button onClick={startTest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors text-base">
            ⌨️ Start Test
          </button>
        </div>
      )}

      {(gameState === 'running' || gameState === 'finished') && (
        <>
          {/* Stats bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{wpm}</div>
                <div className="text-xs text-slate-500">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-xs text-slate-500">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{errors}</div>
                <div className="text-xs text-slate-500">Errors</div>
              </div>
            </div>
            {gameState === 'running' && (
              <div className={`text-4xl font-bold font-mono ${timerColor} tabular-nums`}>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
          </div>

          {gameState === 'running' && (
            <>
              {/* Text display */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-base leading-relaxed font-mono select-none" style={{ letterSpacing: '0.02em' }}>
                  {targetText.split('').map((ch, i) => {
                    let cls = '';
                    if (i < typedText.length) {
                      cls = typedText[i] === ch
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-100 underline';
                    } else if (i === typedText.length) {
                      cls = 'bg-indigo-500 text-white animate-pulse';
                    } else {
                      cls = 'text-slate-400';
                    }
                    return <span key={i} className={cls}>{ch}</span>;
                  })}
                </p>
              </div>

              {/* Input */}
              <textarea
                ref={textareaRef}
                value={typedText}
                onChange={handleType}
                placeholder="Start typing here…"
                rows={4}
                className="w-full border-2 border-indigo-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-mono text-slate-900 resize-none text-base"
              />
            </>
          )}

          {gameState === 'finished' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl font-bold text-slate-900">Test Complete!</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: wpm, label: 'WPM', color: 'text-indigo-600' },
                  { value: `${accuracy}%`, label: 'Accuracy', color: 'text-green-600' },
                  { value: errors, label: 'Errors', color: 'text-red-500' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-500">
                {wpm >= 80 ? '🚀 Excellent! You\'re a speed typist!' : wpm >= 50 ? '👍 Good job! Above average speed.' : '💪 Keep practicing to improve your WPM!'}
              </div>
              <button onClick={startTest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
