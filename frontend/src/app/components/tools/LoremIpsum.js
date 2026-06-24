'use client';
import { useState, useEffect, useCallback } from 'react';

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis quasi architecto beatae vitae dicta explicabo nemo ipsam quia voluptas aspernatur aut odit fugit consequuntur magni dolores eos ratione sequi nesciunt neque porro quisquam dolorem adipisci'.split(' ');

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

function generateSentence() {
  const count = rnd(8, 18);
  const words = Array.from({ length: count }, randomWord);
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
}

function generateParagraph() {
  return Array.from({ length: rnd(4, 7) }, generateSentence).join(' ');
}

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export default function LoremIpsum() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState('plain');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  const generate = useCallback(() => {
    let result = '';
    if (type === 'paragraphs') {
      const paras = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) return LOREM_START + ' ' + generateParagraph();
        return generateParagraph();
      });
      result = format === 'html' ? paras.map(p => `<p>${p}</p>`).join('\n\n') : paras.join('\n\n');
    } else if (type === 'sentences') {
      const sentences = Array.from({ length: count }, generateSentence);
      if (startWithLorem) sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      result = sentences.join(' ');
    } else {
      const words = Array.from({ length: count }, randomWord);
      if (startWithLorem) { words[0] = 'lorem'; words[1] = 'ipsum'; }
      result = words.join(' ');
    }
    setOutput(result);
  }, [type, count, startWithLorem, format, seed]);

  useEffect(() => { generate(); }, [generate]);

  const wordCount = output.split(/\s+/).filter(Boolean).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Generate</label>
          <div className="flex gap-2">
            {['paragraphs', 'sentences', 'words'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Count: <span className="text-indigo-600 font-bold">{count}</span> {type}
          </label>
          <input type="range" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>10</span></div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)}
              className="w-4 h-4 accent-indigo-600" />
            <span className="text-sm text-slate-700">Start with "Lorem ipsum..."</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Format:</span>
            {['plain', 'html'].map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${format === f ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-3 py-1">~{wordCount} words</span>
          <div className="flex gap-2">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium">
              🔀 Regenerate
            </button>
            <button onClick={handleCopy}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors font-medium">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>
        <textarea readOnly rows={8} value={output}
          className="border border-slate-200 rounded-xl px-4 py-3 w-full text-slate-700 text-sm resize-none bg-slate-50 focus:outline-none" />
      </div>
    </div>
  );
}
