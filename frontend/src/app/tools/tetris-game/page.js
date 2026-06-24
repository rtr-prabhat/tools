'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const COLS = 10, ROWS = 20, BLOCK = 30;
const W = COLS * BLOCK, H = ROWS * BLOCK;

const PIECES = {
  I: { shape: [[1,1,1,1]], color: '#06b6d4' },
  O: { shape: [[1,1],[1,1]], color: '#eab308' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a855f7' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#3b82f6' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f97316' },
};
const PIECE_KEYS = Object.keys(PIECES);

function emptyBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }
function randPiece() { const k = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]; return { key: k, ...PIECES[k], x: 3, y: 0 }; }
function rotate(shape) { return shape[0].map((_, i) => shape.map(r => r[i]).reverse()); }

function collides(board, piece, dx = 0, dy = 0, shape = piece.shape) {
  return shape.some((row, ry) => row.some((cell, cx) => {
    if (!cell) return false;
    const nx = piece.x + cx + dx, ny = piece.y + ry + dy;
    return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx]);
  }));
}

function placePiece(board, piece) {
  const nb = board.map(r => [...r]);
  piece.shape.forEach((row, ry) => row.forEach((cell, cx) => {
    if (cell) { const ny = piece.y + ry, nx = piece.x + cx; if (ny >= 0) nb[ny][nx] = piece.color; }
  }));
  return nb;
}

function clearLines(board) {
  const kept = board.filter(r => r.some(c => !c));
  const cleared = ROWS - kept.length;
  const newBoard = [...Array.from({ length: cleared }, () => Array(COLS).fill(0)), ...kept];
  return { board: newBoard, lines: cleared };
}

function ghostY(board, piece) {
  let dy = 0;
  while (!collides(board, piece, 0, dy + 1)) dy++;
  return piece.y + dy;
}

const SCORES = [0, 100, 300, 500, 800];
const levelSpeed = (l) => Math.max(100, 800 - l * 70);

export default function TetrisGame() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const gameRef = useRef({ board: emptyBoard(), piece: null, next: randPiece(), score: 0, lines: 0, level: 1, status: 'idle' });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dropAccRef = useRef(0);
  const [display, setDisplay] = useState({ score: 0, lines: 0, level: 1, status: 'idle' });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    // Board background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c*BLOCK,0); ctx.lineTo(c*BLOCK,H); ctx.stroke(); }
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0,r*BLOCK); ctx.lineTo(W,r*BLOCK); ctx.stroke(); }

    // Placed blocks
    g.board.forEach((row, ry) => row.forEach((cell, cx) => {
      if (cell) {
        ctx.fillStyle = cell;
        ctx.fillRect(cx*BLOCK+1, ry*BLOCK+1, BLOCK-2, BLOCK-2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(cx*BLOCK+1, ry*BLOCK+1, BLOCK-2, 6);
      }
    }));

    // Ghost piece
    if (g.piece && g.status === 'playing') {
      const gy = ghostY(g.board, g.piece);
      if (gy !== g.piece.y) {
        g.piece.shape.forEach((row, ry) => row.forEach((cell, cx) => {
          if (cell) {
            ctx.strokeStyle = g.piece.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(g.piece.x*BLOCK+cx*BLOCK+2, gy*BLOCK+ry*BLOCK+2, BLOCK-4, BLOCK-4);
          }
        }));
      }
    }

    // Active piece
    if (g.piece) {
      g.piece.shape.forEach((row, ry) => row.forEach((cell, cx) => {
        if (cell) {
          const px = (g.piece.x + cx) * BLOCK, py = (g.piece.y + ry) * BLOCK;
          ctx.fillStyle = g.piece.color;
          ctx.fillRect(px+1, py+1, BLOCK-2, BLOCK-2);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(px+1, py+1, BLOCK-2, 6);
        }
      }));
    }

    // Overlays
    if (g.status === 'idle') {
      ctx.fillStyle = 'rgba(15,23,42,0.8)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🟦 Tetris', W/2, H/2 - 30);
      ctx.font = '13px Arial';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('Press Space to start', W/2, H/2 + 4);
      ctx.fillText('← → Move  ↑ Rotate  ↓ Drop', W/2, H/2 + 26);
    } else if (g.status === 'gameover') {
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 30);
      ctx.fillStyle = '#fff';
      ctx.font = '15px Arial';
      ctx.fillText(`Score: ${g.score}`, W/2, H/2 + 4);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '13px Arial';
      ctx.fillText('Press Space to restart', W/2, H/2 + 28);
    } else if (g.status === 'paused') {
      ctx.fillStyle = 'rgba(15,23,42,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⏸ Paused', W/2, H/2);
    }

    // Next piece preview
    if (previewCanvas) {
      const pctx = previewCanvas.getContext('2d');
      pctx.fillStyle = '#1e293b';
      pctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      if (g.next) {
        const pb = BLOCK * 0.8;
        const nx = Math.floor((previewCanvas.width - g.next.shape[0].length * pb) / 2);
        const ny = Math.floor((previewCanvas.height - g.next.shape.length * pb) / 2);
        g.next.shape.forEach((row, ry) => row.forEach((cell, cx) => {
          if (cell) {
            pctx.fillStyle = g.next.color;
            pctx.fillRect(nx + cx*pb+1, ny + ry*pb+1, pb-2, pb-2);
          }
        }));
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const first = randPiece();
    gameRef.current = { board: emptyBoard(), piece: first, next: randPiece(), score: 0, lines: 0, level: 1, status: 'playing' };
    lastTimeRef.current = 0;
    dropAccRef.current = 0;
    setDisplay({ score: 0, lines: 0, level: 1, status: 'playing' });
    draw();
  }, [draw]);

  const loop = useCallback((ts) => {
    const g = gameRef.current;
    if (g.status !== 'playing') { draw(); return; }
    const dt = ts - (lastTimeRef.current || ts);
    lastTimeRef.current = ts;
    dropAccRef.current += dt;
    const sp = levelSpeed(g.level);

    if (dropAccRef.current >= sp) {
      dropAccRef.current = 0;
      if (!collides(g.board, g.piece, 0, 1)) {
        g.piece = { ...g.piece, y: g.piece.y + 1 };
      } else {
        g.board = placePiece(g.board, g.piece);
        const { board: nb, lines } = clearLines(g.board);
        g.board = nb;
        g.score += SCORES[lines] * g.level;
        g.lines += lines;
        g.level = Math.floor(g.lines / 10) + 1;
        g.piece = g.next;
        g.next = randPiece();
        if (collides(g.board, g.piece, 0, 0)) {
          g.status = 'gameover';
          setDisplay(d => ({ ...d, score: g.score, status: 'gameover' }));
          draw();
          return;
        }
        setDisplay({ score: g.score, lines: g.lines, level: g.level, status: 'playing' });
      }
    }
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  useEffect(() => {
    draw();
    const handleKey = (e) => {
      const g = gameRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (g.status === 'idle' || g.status === 'gameover') { startGame(); rafRef.current = requestAnimationFrame(loop); }
        else if (g.status === 'playing') { g.status = 'paused'; setDisplay(d => ({ ...d, status: 'paused' })); draw(); }
        else if (g.status === 'paused') { g.status = 'playing'; setDisplay(d => ({ ...d, status: 'playing' })); lastTimeRef.current = 0; rafRef.current = requestAnimationFrame(loop); }
        return;
      }
      if (g.status !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft': if (!collides(g.board, g.piece, -1, 0)) g.piece = { ...g.piece, x: g.piece.x - 1 }; break;
        case 'ArrowRight': if (!collides(g.board, g.piece, 1, 0)) g.piece = { ...g.piece, x: g.piece.x + 1 }; break;
        case 'ArrowDown': e.preventDefault(); if (!collides(g.board, g.piece, 0, 1)) { g.piece = { ...g.piece, y: g.piece.y + 1 }; g.score += 1; } break;
        case 'ArrowUp': { const rot = rotate(g.piece.shape); if (!collides(g.board, { ...g.piece, shape: rot }, 0, 0)) g.piece = { ...g.piece, shape: rot }; break; }
        case ' ': { e.preventDefault(); let dy = 0; while (!collides(g.board, g.piece, 0, dy + 1)) dy++; g.piece = { ...g.piece, y: g.piece.y + dy }; g.score += dy * 2; break; }
        default: break;
      }
      draw();
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const move = (action) => {
    const g = gameRef.current;
    if (g.status !== 'playing') return;
    if (action === 'left' && !collides(g.board, g.piece, -1, 0)) g.piece = { ...g.piece, x: g.piece.x - 1 };
    if (action === 'right' && !collides(g.board, g.piece, 1, 0)) g.piece = { ...g.piece, x: g.piece.x + 1 };
    if (action === 'down' && !collides(g.board, g.piece, 0, 1)) { g.piece = { ...g.piece, y: g.piece.y + 1 }; g.score++; }
    if (action === 'rotate') { const rot = rotate(g.piece.shape); if (!collides(g.board, { ...g.piece, shape: rot }, 0, 0)) g.piece = { ...g.piece, shape: rot }; }
    if (action === 'drop') { let dy = 0; while (!collides(g.board, g.piece, 0, dy + 1)) dy++; g.piece = { ...g.piece, y: g.piece.y + dy }; g.score += dy * 2; }
    draw();
  };

  const mb = { background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontSize: 18, cursor: 'pointer', fontWeight: 700, minWidth: 52 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>🟦 Tetris</h1>
      <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>Stack blocks and clear lines — Space to start/pause</p>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Game Canvas */}
        <div style={{ background: '#0f172a', borderRadius: 16, padding: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', borderRadius: 12 }} />
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 140 }}>
          {/* Next Piece */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Next</div>
            <canvas ref={previewRef} width={96} height={80} style={{ display: 'block', borderRadius: 8, margin: '0 auto', background: '#1e293b' }} />
          </div>

          {/* Stats */}
          {[{ label: 'Score', value: display.score.toLocaleString(), color: '#6366f1' }, { label: 'Level', value: display.level, color: '#f59e0b' }, { label: 'Lines', value: display.lines, color: '#22c55e' }].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}

          {/* Start/Pause */}
          <button onClick={() => {
            const g = gameRef.current;
            if (g.status === 'idle' || g.status === 'gameover') { startGame(); rafRef.current = requestAnimationFrame(loop); }
            else if (g.status === 'playing') { g.status = 'paused'; setDisplay(d => ({ ...d, status: 'paused' })); draw(); }
            else if (g.status === 'paused') { g.status = 'playing'; setDisplay(d => ({ ...d, status: 'playing' })); lastTimeRef.current = 0; rafRef.current = requestAnimationFrame(loop); }
          }} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {display.status === 'playing' ? '⏸ Pause' : display.status === 'paused' ? '▶ Resume' : '▶ Start'}
          </button>
        </div>
      </div>

      {/* Mobile Controls */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button onClick={() => move('rotate')} style={mb}>↑ Rotate</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => move('left')} style={mb}>←</button>
          <button onClick={() => move('down')} style={mb}>↓</button>
          <button onClick={() => move('right')} style={mb}>→</button>
        </div>
        <button onClick={() => move('drop')} style={{ ...mb, background: '#4f46e5', padding: '10px 32px', fontSize: 13 }}>⬇ Hard Drop</button>
      </div>
    </div>
  );
}
