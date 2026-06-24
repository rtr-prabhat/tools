'use client';
import { useState, useRef, useEffect } from 'react';

const COLORS = ['#1e293b', '#1e3a5f', '#1d4ed8', '#374151', '#0f3460'];
const COLOR_LABELS = ['Black', 'Navy', 'Blue', 'Charcoal', 'Dark Blue'];
const SIZES = [{ label: 'Fine', value: 2 }, { label: 'Normal', value: 3 }, { label: 'Bold', value: 5 }];

export default function SignatureMaker() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    setHasDrawn(true);
    lastPos.current = pos;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const downloadPng = (transparent = false) => {
    const canvas = canvasRef.current;
    if (transparent) {
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tCtx = temp.getContext('2d');
      tCtx.drawImage(canvas, 0, 0);
      const imgData = tCtx.getImageData(0, 0, temp.width, temp.height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i] > 240 && imgData.data[i + 1] > 240 && imgData.data[i + 2] > 240) {
          imgData.data[i + 3] = 0;
        }
      }
      tCtx.putImageData(imgData, 0, 0);
      const link = document.createElement('a');
      link.download = 'signature-transparent.png';
      link.href = temp.toDataURL('image/png');
      link.click();
    } else {
      const link = document.createElement('a');
      link.download = 'signature.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Draw Your Signature</h3>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={700}
            height={220}
            style={{ touchAction: 'none', cursor: 'crosshair' }}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-300 text-lg select-none">Sign here…</p>
            </div>
          )}
        </div>

        {/* Underline label */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 border-b-2 border-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Your signature</span>
          <div className="flex-1 border-b-2 border-slate-300" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Color */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Pen Color</p>
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <button key={c} onClick={() => setColor(c)} title={COLOR_LABELS[i]}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'hover:scale-105'}`} />
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Pen Size</p>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button key={s.value} onClick={() => setLineWidth(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${lineWidth === s.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          <div className="ml-auto">
            <button onClick={clearCanvas}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Download */}
      <div className="flex gap-3">
        <button onClick={() => downloadPng(false)} disabled={!hasDrawn}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          ⬇️ Download PNG
        </button>
        <button onClick={() => downloadPng(true)} disabled={!hasDrawn}
          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          🪟 Transparent PNG
        </button>
      </div>
    </div>
  );
}
