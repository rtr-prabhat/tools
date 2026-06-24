'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const COLS = 20, ROWS = 20, CELL = 20;
const W = COLS * CELL, H = ROWS * CELL;
const DIRS = { ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
               w: {x:0,y:-1}, s: {x:0,y:1}, a: {x:-1,y:0}, d: {x:1,y:0},
               W: {x:0,y:-1}, S: {x:0,y:1}, A: {x:-1,y:0}, D: {x:1,y:0} };

function randFood(snake) {
  let pos;
  do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ snake: [], food: {x:10,y:5}, dir: {x:1,y:0}, nextDir: {x:1,y:0}, score: 0, status: 'idle', speed: 150 });
  const intervalRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, highScore: 0, status: 'idle' });

  const getHighScore = () => {
    if (typeof localStorage !== 'undefined') return parseInt(localStorage.getItem('snake_hs') || '0');
    return 0;
  };
  const setHighScore = (n) => { if (typeof localStorage !== 'undefined') localStorage.setItem('snake_hs', String(n)); };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { snake, food, status, score } = stateRef.current;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,H); ctx.stroke(); }
    for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(0,j*CELL); ctx.lineTo(W,j*CELL); ctx.stroke(); }

    // Snake
    snake.forEach((seg, idx) => {
      const isHead = idx === 0;
      const alpha = 0.4 + 0.6 * (1 - idx / snake.length);
      ctx.fillStyle = isHead ? '#4f46e5' : `rgba(99,102,241,${alpha})`;
      const pad = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2, isHead ? 5 : 3);
      ctx.fill();
      if (isHead) {
        ctx.fillStyle = '#a5b4fc';
        const eyeOffset = stateRef.current.dir.x !== 0 ? 4 : 2;
        ctx.fillRect(seg.x*CELL+CELL/2-eyeOffset, seg.y*CELL+4, 3, 3);
        ctx.fillRect(seg.x*CELL+CELL/2+eyeOffset-3, seg.y*CELL+4, 3, 3);
      }
    });

    // Food
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2-2, food.y*CELL+CELL/2-3, 2.5, 0, Math.PI*2);
    ctx.fill();

    // Overlay
    if (status === 'idle') {
      ctx.fillStyle = 'rgba(15,23,42,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🐍 Snake', W/2, H/2 - 24);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('Press Space or click to start', W/2, H/2 + 8);
      ctx.fillText('WASD or Arrow Keys to move', W/2, H/2 + 30);
    } else if (status === 'gameover') {
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', W/2, H/2 - 30);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Score: ${score}`, W/2, H/2 + 4);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '13px Arial';
      ctx.fillText('Press Space or click to restart', W/2, H/2 + 28);
    }
  }, []);

  const startGame = useCallback(() => {
    const initSnake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    stateRef.current = { snake: initSnake, food: randFood(initSnake), dir: {x:1,y:0}, nextDir: {x:1,y:0}, score: 0, status: 'playing', speed: 150 };
    setDisplay(d => ({ ...d, score: 0, status: 'playing' }));
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, stateRef.current.speed);
  }, []);

  const tick = useCallback(() => {
    const gs = stateRef.current;
    if (gs.status !== 'playing') return;
    gs.dir = gs.nextDir;
    const head = { x: gs.snake[0].x + gs.dir.x, y: gs.snake[0].y + gs.dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || gs.snake.some(s => s.x === head.x && s.y === head.y)) {
      gs.status = 'gameover';
      clearInterval(intervalRef.current);
      const hs = getHighScore();
      if (gs.score > hs) { setHighScore(gs.score); setDisplay(d => ({ ...d, highScore: gs.score, status: 'gameover' })); }
      else setDisplay(d => ({ ...d, status: 'gameover' }));
      draw();
      return;
    }
    const ate = head.x === gs.food.x && head.y === gs.food.y;
    gs.snake = [head, ...gs.snake];
    if (!ate) gs.snake.pop();
    else {
      gs.score++;
      gs.food = randFood(gs.snake);
      setDisplay(d => ({ ...d, score: gs.score }));
      if (gs.score % 5 === 0 && gs.speed > 60) {
        gs.speed = Math.max(60, gs.speed - 15);
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, gs.speed);
      }
    }
    draw();
  }, [draw]);

  // Fix: tick needs to be stable reference
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    setDisplay(d => ({ ...d, highScore: getHighScore() }));
    const handleKey = (e) => {
      const gs = stateRef.current;
      if (e.code === 'Space') { e.preventDefault(); if (gs.status !== 'playing') startGame(); return; }
      const nd = DIRS[e.key];
      if (!nd) return;
      if (nd.x === -gs.dir.x && nd.y === -gs.dir.y) return;
      gs.nextDir = nd;
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); clearInterval(intervalRef.current); };
  }, []);

  // Reassign tick when startGame changes
  useEffect(() => {
    const origSetInterval = window.setInterval;
    return () => {};
  }, [tick]);

  const handleCanvasClick = () => {
    if (stateRef.current.status !== 'playing') startGame();
  };

  const btnStyle = (color) => ({
    background: color, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px',
    fontSize: 18, cursor: 'pointer', fontWeight: 700, minWidth: 52, minHeight: 48,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>🐍 Snake</h1>
      <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>WASD / Arrow Keys to move — eat 🔴 food to grow</p>

      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: 20, display: 'inline-block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#4f46e5' }}>{display.score}</div>
          </div>
          <button onClick={() => { if (stateRef.current.status !== 'playing') startGame(); else { stateRef.current.status = 'idle'; clearInterval(intervalRef.current); setDisplay(d => ({ ...d, status: 'idle' })); draw(); } }}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {display.status === 'playing' ? '⏹ Stop' : '▶ Start'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Best</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b' }}>{display.highScore}</div>
          </div>
        </div>

        <canvas ref={canvasRef} width={W} height={H} onClick={handleCanvasClick}
          style={{ display: 'block', borderRadius: 12, cursor: display.status !== 'playing' ? 'pointer' : 'default' }} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={() => { const gs = stateRef.current; const nd = {x:0,y:-1}; if (nd.y !== gs.dir.y || nd.x !== gs.dir.x) gs.nextDir = nd; }} style={btnStyle('#334155')}>↑</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { const gs = stateRef.current; const nd = {x:-1,y:0}; if (nd.x !== -gs.dir.x) gs.nextDir = nd; }} style={btnStyle('#334155')}>←</button>
            <button onClick={() => { const gs = stateRef.current; const nd = {x:0,y:1}; if (nd.y !== -gs.dir.y) gs.nextDir = nd; }} style={btnStyle('#334155')}>↓</button>
            <button onClick={() => { const gs = stateRef.current; const nd = {x:1,y:0}; if (nd.x !== -gs.dir.x) gs.nextDir = nd; }} style={btnStyle('#334155')}>→</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
        Speed increases every 5 food eaten • No walls to pass through
      </div>
    </div>
  );
}
