'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToolState } from '../../context/ToolStateContext';

const ZODIAC = [
  { sign: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius',  emoji: '♒', start: [1, 20],  end: [2, 18] },
  { sign: 'Pisces',    emoji: '♓', start: [2, 19],  end: [3, 20] },
  { sign: 'Aries',     emoji: '♈', start: [3, 21],  end: [4, 19] },
  { sign: 'Taurus',    emoji: '♉', start: [4, 20],  end: [5, 20] },
  { sign: 'Gemini',    emoji: '♊', start: [5, 21],  end: [6, 20] },
  { sign: 'Cancer',    emoji: '♋', start: [6, 21],  end: [7, 22] },
  { sign: 'Leo',       emoji: '♌', start: [7, 23],  end: [8, 22] },
  { sign: 'Virgo',     emoji: '♍', start: [8, 23],  end: [9, 22] },
  { sign: 'Libra',     emoji: '♎', start: [9, 23],  end: [10, 22] },
  { sign: 'Scorpio',   emoji: '♏', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius',emoji: '♐',start: [11, 22], end: [12, 21] },
];

function getZodiac(month, day) {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start, [em, ed] = z.end;
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z;
    } else if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
  }
  return ZODIAC[0];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AgeCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const [dob, setDob] = useState('');
  const [calcTo, setCalcTo] = useState(today);
  const { updateState } = useToolState();

  const result = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    const to = new Date(calcTo);
    if (birth > to) return null;

    let years = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth() - birth.getMonth();
    let days = to.getDate() - birth.getDate();

    if (days < 0) { months--; const prev = new Date(to.getFullYear(), to.getMonth(), 0); days += prev.getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((to - birth) / 86400000);
    const hours = totalDays * 24;
    const minutes = hours * 60;

    const thisYearBday = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    let nextBday = thisYearBday <= to ? new Date(to.getFullYear() + 1, birth.getMonth(), birth.getDate()) : thisYearBday;
    const daysToNextBday = Math.ceil((nextBday - to) / 86400000);

    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());
    const bornDay = DAYS[birth.getDay()];

    return { years, months, days, totalDays, hours, minutes, daysToNextBday, zodiac, bornDay };
  }, [dob, calcTo]);

  // Push age result to shared context for live preview
  useEffect(() => {
    updateState('ageYears', result?.years ?? undefined);
    updateState('ageMonths', result?.months ?? undefined);
    updateState('ageDays', result?.days ?? undefined);
  }, [result, updateState]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={dob}
            max={today}
            onChange={e => setDob(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Calculate to</label>
          <input
            type="date"
            value={calcTo}
            onChange={e => setCalcTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
          />
        </div>
      </div>

      {result ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[['Years', result.years, 'text-indigo-600'], ['Months', result.months, 'text-purple-600'], ['Days', result.days, 'text-pink-600']].map(([lbl, val, color]) => (
              <div key={lbl} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                <div className={`text-3xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-slate-500 mt-1">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <p className="text-sm font-semibold text-slate-700 mb-3">Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Born on</span>
                <span className="font-medium text-slate-800">{result.bornDay}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Zodiac</span>
                <span className="font-medium text-slate-800">{result.zodiac.emoji} {result.zodiac.sign}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total days</span>
                <span className="font-medium text-slate-800">{result.totalDays.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Next birthday in</span>
                <span className="font-medium text-slate-800">{result.daysToNextBday} days</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-sm font-semibold text-slate-700 mb-2">Fun Facts ✨</p>
            <div className="space-y-1 text-sm text-slate-600">
              <p>You have lived approximately <strong className="text-indigo-700">{result.hours.toLocaleString()} hours</strong></p>
              <p>…or <strong className="text-purple-700">{result.minutes.toLocaleString()} minutes</strong></p>
            </div>
          </div>
        </>
      ) : dob ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">Date of birth must be before the target date.</div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 text-sm">Enter your date of birth to calculate your age.</div>
      )}
    </div>
  );
}
