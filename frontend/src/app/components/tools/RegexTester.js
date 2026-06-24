'use client';
import { useState, useMemo } from 'react';

const REFERENCE = [
  ['.', 'Any character except newline'],
  ['\\d', 'Digit (0–9)'],
  ['\\D', 'Non-digit'],
  ['\\w', 'Word character (a-z, A-Z, 0-9, _)'],
  ['\\W', 'Non-word character'],
  ['\\s', 'Whitespace (space, tab, newline)'],
  ['\\S', 'Non-whitespace'],
  ['^', 'Start of string/line'],
  ['$', 'End of string/line'],
  ['*', '0 or more of preceding'],
  ['+', '1 or more of preceding'],
  ['?', '0 or 1 of preceding'],
  ['{n,m}', 'Between n and m repetitions'],
  ['[abc]', 'Character class — a, b, or c'],
  ['[^abc]', 'Negated class — not a, b, or c'],
  ['(abc)', 'Capture group'],
  ['(?:abc)', 'Non-capturing group'],
  ['(?=abc)', 'Positive lookahead'],
  ['(?!abc)', 'Negative lookahead'],
  ['a|b', 'a or b'],
  ['\\b', 'Word boundary'],
  ['\\n', 'Newline'],
];

function getMatches(pattern, flags, str) {
  if (!pattern || !str) return { matches: [], segments: str ? [{ text: str, isMatch: false }] : [], error: null };
  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
  try {
    const globalFlag = flagStr.includes('g') ? flagStr : flagStr + 'g';
    const matches = [...str.matchAll(new RegExp(pattern, globalFlag))];
    const segments = [];
    let lastIndex = 0;
    for (const m of matches) {
      if (m.index > lastIndex) segments.push({ text: str.slice(lastIndex, m.index), isMatch: false });
      segments.push({ text: m[0], isMatch: true, groups: m.slice(1) });
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) { lastIndex++; } // prevent infinite loop on zero-width matches
    }
    if (lastIndex < str.length) segments.push({ text: str.slice(lastIndex), isMatch: false });
    return { matches, segments, error: null };
  } catch (e) {
    return { matches: [], segments: [{ text: str, isMatch: false }], error: e.message };
  }
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState('The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.');
  const [replacement, setReplacement] = useState('[$&]');
  const [tab, setTab] = useState('matches');

  const { matches, segments, error } = useMemo(() => getMatches(pattern, flags, testStr), [pattern, flags, testStr]);

  const replaceResult = useMemo(() => {
    if (!pattern || !testStr) return testStr;
    try {
      const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
      return testStr.replace(new RegExp(pattern, flagStr), replacement);
    } catch { return testStr; }
  }, [pattern, flags, testStr, replacement]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Regular Expression</label>
          <div className="flex gap-2 items-center">
            <span className="text-slate-400 font-mono text-lg">/</span>
            <input value={pattern} onChange={e => setPattern(e.target.value)}
              placeholder="\b\w+\b"
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 text-slate-900 font-mono" />
            <span className="text-slate-400 font-mono text-lg">/</span>
            <div className="flex gap-1">
              {Object.keys(flags).map(f => (
                <button key={f} onClick={() => setFlags(prev => ({ ...prev, [f]: !prev[f] }))}
                  className={`w-8 h-8 rounded-lg text-sm font-mono font-semibold transition-colors ${flags[f] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mt-1.5">⚠️ {error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Test String</label>
          <textarea rows={5} value={testStr} onChange={e => setTestStr(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono text-sm resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {['matches', 'replace', 'reference'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${matches.length ? 'text-green-700' : 'text-slate-500'}`}>
                  {pattern ? `${matches.length} match${matches.length !== 1 ? 'es' : ''} found` : 'Enter a pattern above'}
                </span>
              </div>
              {testStr && (
                <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all border border-slate-200">
                  {segments.map((seg, i) =>
                    seg.isMatch
                      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">{seg.text}</mark>
                      : <span key={i}>{seg.text}</span>
                  )}
                </div>
              )}
              {matches.some(m => m.length > 1) && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Capture Groups</p>
                  <div className="space-y-1">
                    {matches.slice(0, 5).map((m, mi) =>
                      m.slice(1).map((g, gi) => g !== undefined && (
                        <div key={`${mi}-${gi}`} className="text-xs font-mono bg-indigo-50 text-indigo-700 rounded px-2 py-1">
                          Match {mi + 1}, Group {gi + 1}: <strong>{g}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'replace' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Replacement (use $& for full match, $1 for group 1)</label>
                <input value={replacement} onChange={e => setReplacement(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 font-mono" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Result</p>
                <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap break-all border border-slate-200 text-slate-800">
                  {replaceResult || <span className="text-slate-400">Enter pattern and test string above</span>}
                </div>
              </div>
            </div>
          )}

          {tab === 'reference' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100"><th className="text-left py-2 pr-4 font-semibold text-slate-700 font-mono">Pattern</th><th className="text-left py-2 font-semibold text-slate-700">Description</th></tr></thead>
                <tbody>
                  {REFERENCE.map(([pat, desc]) => (
                    <tr key={pat} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => setPattern(pat)}>
                      <td className="py-2 pr-4 font-mono text-indigo-600 font-medium">{pat}</td>
                      <td className="py-2 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-3">Click any row to use that pattern.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
