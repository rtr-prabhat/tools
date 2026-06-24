'use client';
import { useState } from 'react';

function numberToIndianWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
  function threeDigits(n) {
    if (n < 100) return twoDigits(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '');
  }
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;
  let result = '';
  if (crore) result += threeDigits(crore) + ' Crore ';
  if (lakh) result += twoDigits(lakh) + ' Lakh ';
  if (thousand) result += twoDigits(thousand) + ' Thousand ';
  if (remainder) result += threeDigits(remainder);
  return result.trim();
}

function toIndianFormat(n) {
  return n.toLocaleString('en-IN');
}

function toScientific(n) {
  if (n === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantissa = (n / Math.pow(10, exp)).toFixed(2);
  return `${mantissa} × 10^${exp}`;
}

const EXAMPLES = ['1000', '100000', '1000000', '10000000'];

export default function NumberToWords() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');

  const convert = () => {
    const raw = parseFloat(input);
    if (isNaN(raw) || raw < 0) return;
    const intPart = Math.floor(raw);
    const decStr = input.includes('.') ? input.split('.')[1] : '';
    const paise = decStr ? parseInt(decStr.padEnd(2, '0').slice(0, 2)) : 0;
    const words = numberToIndianWords(intPart);
    const rupeesInWords = paise
      ? `Rupees ${words} and ${numberToIndianWords(paise)} Paise Only`
      : `Rupees ${words} Only`;
    setResult({
      words,
      rupeesInWords,
      indian: '₹' + toIndianFormat(intPart) + (decStr ? '.' + decStr : ''),
      international: raw.toLocaleString('en-US'),
      scientific: toScientific(raw),
    });
  };

  const copy = (key, val) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const rows = result ? [
    { key: 'words', label: 'In Words', value: result.words },
    { key: 'rupeesInWords', label: 'Amount in Words (for cheques)', value: result.rupeesInWords },
    { key: 'indian', label: 'Indian Format', value: result.indian },
    { key: 'international', label: 'International Format', value: result.international },
    { key: 'scientific', label: 'Scientific Notation', value: result.scientific },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Enter a Number</label>
        <input
          type="number"
          value={input}
          onChange={e => { setInput(e.target.value); setResult(null); }}
          placeholder="e.g. 12345678"
          className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 text-lg"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => { setInput(ex); setResult(null); }}
              className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full px-3 py-1.5 transition-colors">
              {Number(ex).toLocaleString('en-IN')}
            </button>
          ))}
        </div>
        <button onClick={convert}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors w-full sm:w-auto">
          Convert
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          {rows.map(row => (
            <div key={row.key} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{row.label}</p>
                  <p className={`text-slate-900 break-words ${row.key === 'words' || row.key === 'rupeesInWords' ? 'text-base font-medium' : 'font-mono text-sm'}`}>
                    {row.value}
                  </p>
                </div>
                <button onClick={() => copy(row.key, row.value)}
                  className="shrink-0 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors">
                  {copied === row.key ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
