'use client';
import { useState, useRef, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fmtSize = (b) => b >= 1024 * 1024 ? (b / 1024 / 1024).toFixed(2) + ' MB' : (b / 1024).toFixed(0) + ' KB';

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [targetSize, setTargetSize] = useState('');
  const [targetUnit, setTargetUnit] = useState('KB');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
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
    if (targetSize) {
      const kb = targetUnit === 'MB' ? parseFloat(targetSize) * 1024 : parseFloat(targetSize);
      fd.append('targetSizeKB', kb);
    }
    try {
      const res = await fetch(`${API}/api/pdf/compress`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setTargetSize('');
    setTargetUnit('KB');
  };

  const targetBytes = targetSize
    ? parseFloat(targetSize) * (targetUnit === 'MB' ? 1024 * 1024 : 1024)
    : null;

  return (
    <div className="space-y-5">

      {/* Upload zone — shown only when no file selected */}
      {!file && (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-14 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="text-5xl mb-4">📑</div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Drop your PDF here or click to browse</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5">PDF files only · Max 20MB</p>
        </div>
      )}

      {error && !file && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {/* File selected: preview + controls */}
      {file && !result && (
        <>
          {/* PDF Preview card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-shrink-0">📄</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-sm text-slate-400 dark:text-slate-500">{fmtSize(file.size)}</span>
                <button
                  onClick={reset}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-2xl leading-none"
                  aria-label="Remove file"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* PDF iframe preview */}
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full border-0 bg-slate-50 dark:bg-slate-800"
                style={{ height: '320px' }}
                title="PDF Preview"
              />
            )}

            {/* Lossless badge */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700">
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-3 py-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Lossless compression — content 100% identical to original
              </span>
            </div>
          </div>

          {/* Target size input */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
              Desired Output Size
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Enter a target — we&apos;ll compress as close to it as possible.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                placeholder={targetUnit === 'KB' ? 'e.g. 500' : 'e.g. 2'}
                min="1"
                className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                {['KB', 'MB'].map(u => (
                  <button
                    key={u}
                    onClick={() => setTargetUnit(u)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                      targetUnit === u
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {targetBytes !== null && targetBytes >= file.size && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                ⚠ Target is larger than original ({fmtSize(file.size)}) — maximum available compression will still be applied.
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full justify-center text-base"
          >
            {loading && (
              <span className="animate-spin border-2 border-t-transparent rounded-full w-5 h-5 border-white inline-block" />
            )}
            {loading ? 'Compressing PDF…' : '🗜️ Compress PDF'}
          </button>
        </>
      )}

      {/* Result panel */}
      {result && (
        <div className="space-y-4">
          {/* Target achieved / missed banner */}
          {result.targetAchieved === true && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm font-medium">
              ✅ Target size achieved!
            </div>
          )}
          {result.targetAchieved === false && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              ⚠ Could not reach target — best compression gives{' '}
              <strong className="mx-1">{fmtSize(result.compressedSize)}</strong>.
              This PDF may already be well-compressed.
            </div>
          )}

          {/* Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-slate-600 dark:text-slate-300">{fmtSize(result.originalSize)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Original</p>
              </div>
              <div>
                <p className={`text-xl font-bold ${result.savedPercent > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {result.savedPercent > 0 ? `↓ ${result.savedPercent}%` : 'No change'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Saved</p>
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{fmtSize(result.compressedSize)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Compressed</p>
              </div>
            </div>

            {/* Progress bar */}
            {result.savedPercent > 0 && (
              <div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <div
                    className="bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${100 - result.savedPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  <span>Compressed ({fmtSize(result.compressedSize)})</span>
                  <span>Original ({fmtSize(result.originalSize)})</span>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>📄 {result.pageCount} page{result.pageCount !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All content preserved
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`${API}${result.downloadUrl}`}
                download
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 font-medium transition-colors flex items-center gap-2 text-sm"
              >
                ⬇️ Download Compressed PDF
              </a>
              <button
                onClick={reset}
                className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-5 py-2.5 font-medium transition-colors text-sm"
              >
                Compress Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
