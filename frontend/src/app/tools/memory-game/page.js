'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const EMOJI_POOL = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐙','🦋'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildDeck(pairs) {
  const emojis = EMOJI_POOL.slice(0, pairs);
  return shuffle([...emojis, ...emojis].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const pairs = difficulty === 'easy' ? 8 : 12;
  const gridCols = difficulty === 'easy' ? 4 : 4;

  const [cards, setCards] = useState(() => buildDeck(pairs));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, won]);

  const newGame = useCallback(() => {
    clearInterval(timerRef.current);
    setCards(buildDeck(pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setWon(false);
    setTime(0);
    setStarted(false);
    setDisabled(false);
  }, [pairs]);

  useEffect(() => { newGame(); }, [difficulty]);

  const handleFlip = (card) => {
    if (disabled || card.flipped || card.matched) return;
    if (!started) setStarted(true);
    const newFlipped = [...flipped, card.id];
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setDisabled(true);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id));
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
          const newMatched = matched + 1;
          setMatched(newMatched);
          setFlipped([]);
          setDisabled(false);
          if (newMatched === pairs) { setWon(true); clearInterval(timerRef.current); }
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setDisabled(false);
        }, 900);
      }
    }
  };

  const totalCards = pairs * 2;
  const progress = (matched / pairs) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>🃏 Memory Match</h1>
      <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>Flip cards and find matching pairs</p>

      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', padding: 24, width: '100%', maxWidth: 520 }}>
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['easy','hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  borderColor: difficulty === d ? '#6366f1' : '#e2e8f0',
                  background: difficulty === d ? '#eef2ff' : '#f8fafc',
                  color: difficulty === d ? '#4f46e5' : '#64748b' }}>
                {d === 'easy' ? '🟢 Easy (8 pairs)' : '🔴 Hard (12 pairs)'}
              </button>
            ))}
          </div>
          <button onClick={newGame}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 New Game
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {[{ label: 'Moves', value: moves }, { label: 'Matches', value: `${matched}/${pairs}` }, { label: 'Time', value: formatTime(time) }].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', background: '#f8fafc', borderRadius: 12, padding: '10px 8px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 6, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: 8 }} />
        </div>

        {/* Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 10, perspective: 800 }}>
          {cards.map(card => {
            const isVisible = card.flipped || card.matched;
            return (
              <div key={card.id} onClick={() => handleFlip(card)}
                style={{ aspectRatio: '1', cursor: card.matched ? 'default' : 'pointer', perspective: 600 }}>
                <div style={{
                  width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
                  transform: isVisible ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}>
                  {/* Back */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: card.matched ? 'linear-gradient(135deg, #bbf7d0, #6ee7b7)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, border: card.matched ? '2px solid #22c55e' : '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                  }}>❓</div>
                  {/* Front */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.matched ? '#f0fdf4' : '#fff',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, border: card.matched ? '2px solid #22c55e' : '2px solid #c7d2fe',
                    boxShadow: card.matched ? '0 2px 8px rgba(34,197,94,0.2)' : '0 2px 8px rgba(99,102,241,0.1)',
                  }}>{card.emoji}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Screen */}
        {won && (
          <div style={{ marginTop: 20, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#166534', marginBottom: 4 }}>You Won!</div>
            <div style={{ fontSize: 14, color: '#4b7c56', marginBottom: 12 }}>
              Completed in <strong>{moves} moves</strong> and <strong>{formatTime(time)}</strong>
            </div>
            <button onClick={newGame} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
