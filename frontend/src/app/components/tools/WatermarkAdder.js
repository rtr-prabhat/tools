'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fmtSize = (b) => b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB';

const PRESETS = ['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY', 'WATERMARK'];

export default function WatermarkAdder() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('white');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('text', text);
    fd.append('opacity', opacity);
    fd.append('fontSize', fontSize);
    fd.append('color', color);
    try {
      const res = await fetch(`${API}/api/image/watermark`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        className={file
          ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer'
          : 'border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors'}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <div className="text-3xl mb-2">🖼️</div>
            <p className="font-medium text-slate-900">{file.name}</p>
            <p className="text-sm text-slate-500 mt-1">{fmtSize(file.size)}</p>
            <p className="text-xs text-indigo-500 mt-1">Click to change</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">🔏</div>
            <p className="font-medium text-slate-700">Drop your image or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">JPEG, PNG, WebP — max 20 MB</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {/* Watermark text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Watermark Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900"
            placeholder="Enter watermark text..."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setText(p)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${text === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Color</label>
          <div className="flex gap-2">
            {['white', 'black'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${color === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {c === 'white' ? '⬜ White' : '⬛ Black'}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Opacity</label>
            <span className="text-sm text-slate-500">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range" min="0.05" max="1" step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Subtle</span><span>Visible</span>
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Font Size</label>
            <span className="text-sm text-slate-500">{fontSize}px</span>
          </div>
          <input
            type="range" min="12" max="120" step="4"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Small</span><span>Large</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
          💡 Watermark will appear as diagonal text across the centre of the image
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <p className="font-semibold text-green-800">Watermark added!</p>
          <a
            href={`${API}${result.downloadUrl}`}
            download
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors inline-flex items-center gap-2"
          >
            ⬇️ Download Watermarked Image
          </a>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading || !text.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />}
        {loading ? 'Adding Watermark…' : '🔏 Add Watermark'}
      </button>
    </div>
  );
}
