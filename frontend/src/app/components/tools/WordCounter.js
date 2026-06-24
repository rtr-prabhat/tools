'use client';

import { useState, useMemo } from 'react';

const STOP_WORDS = new Set([
  'the','a','an','is','in','of','to','and','or','for','it','be','was',
  'are','with','this','that','on','at','by','from','as','i','he','she',
  'we','they','you','my','our','your','his','her','its','their',
]);

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.match(/\S+/g) || [];
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean && !STOP_WORDS.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      words: wordCount,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, '').length,
      sentences,
      paragraphs,
      readingTime,
      topWords,
    };
  }, [text]);

  const statBoxes = [
    { label: 'Words', value: stats.words },
    { label: 'Characters', value: stats.chars },
    { label: 'Chars (no space)', value: stats.charsNoSpace },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Reading time', value: `${stats.readingTime} min` },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">Your Text</label>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          rows={12}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statBoxes.map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
            <div className="text-2xl font-bold text-indigo-600">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {stats.topWords.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Top Words</p>
          <div className="flex flex-wrap gap-2">
            {stats.topWords.map(([word, count]) => (
              <span key={word} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-700">
                <span className="font-medium">{word}</span>
                <span className="text-slate-400 ml-1">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
