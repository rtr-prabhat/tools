'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fmtSize = (b) => b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter((f) => f.type === 'application/pdf');
    setFiles((prev) => [...prev, ...pdfs]);
    setResult(null);
    setError('');
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const moveUp = (idx) => {
    if (idx === 0) return;
    setFiles((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const moveDown = (idx) => {
    setFiles((prev) => {
      if (idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length < 2) { setError('Please add at least 2 PDF files to merge.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    try {
      const res = await fetch(`${API}/api/pdf/merge`, { method: 'POST', body: fd });
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
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="text-4xl mb-3">📎</div>
        <p className="font-medium text-slate-700">Drop PDF files here or click to browse</p>
        <p className="text-sm text-slate-400 mt-1">Select multiple PDFs — they will be merged in order</p>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-slate-700">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
            <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">Clear all</button>
          </div>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                <p className="text-xs text-slate-400">{fmtSize(f.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-600"
                  title="Move up"
                >↑</button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === files.length - 1}
                  className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-600"
                  title="Move down"
                >↓</button>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors ml-1"
                  title="Remove"
                >✕</button>
              </div>
            </div>
          ))}
          <button
            onClick={() => inputRef.current.click()}
            className="w-full text-sm text-indigo-600 hover:text-indigo-800 py-2 border border-dashed border-indigo-300 rounded-xl mt-2 hover:bg-indigo-50 transition-colors"
          >
            + Add more PDFs
          </button>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">PDFs merged successfully!</p>
              {result.pageCount && (
                <p className="text-sm text-green-700">Total pages: {result.pageCount}</p>
              )}
            </div>
          </div>
          <a
            href={`${API}${result.downloadUrl}`}
            download
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex items-center gap-2 w-fit"
          >
            ⬇️ Download Merged PDF
          </a>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={files.length < 2 || loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && <span className="animate-spin border border-t-transparent rounded-full w-5 h-5 border-white inline-block" />}
        {loading ? 'Merging…' : `Merge ${files.length > 0 ? files.length : ''} PDFs`}
      </button>
    </div>
  );
}
