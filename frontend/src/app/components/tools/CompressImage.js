'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fmtSize = (b) => b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB';

export default function CompressImage() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(75);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('quality', quality);
    try {
      const res = await fetch(`${API}/api/image/compress`, { method: 'POST', body: fd });
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
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={file
          ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/40 rounded-2xl p-10 text-center cursor-pointer'
          : 'border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors'}
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
            <p className="text-xs text-indigo-500 mt-2">Click to change file</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">📁</div>
            <p className="font-medium text-slate-700">Drop your image here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">JPEG, PNG, WebP — max 20MB</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-slate-700">Quality: {quality}%</label>
          <span className="text-xs text-slate-400">{quality < 40 ? 'High compression' : quality < 70 ? 'Balanced' : 'High quality'}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
          <p className="font-semibold text-green-800">Compression complete!</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{fmtSize(result.originalSize)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Original</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{result.savedPercent}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{fmtSize(result.compressedSize)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Compressed</p>
            </div>
          </div>
          <a
            href={`${API}${result.downloadUrl}`}
            download
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex items-center gap-2 w-fit"
          >
            ⬇️ Download Compressed Image
          </a>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && <span className="animate-spin border border-t-transparent rounded-full w-5 h-5 border-white inline-block" />}
        {loading ? 'Compressing…' : 'Compress Image'}
      </button>
    </div>
  );
}
