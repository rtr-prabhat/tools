'use client';
import { useState, useRef } from 'react';

export default function OcrTool() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setText('');
    setStatus('idle');
    setError('');
    setProgress(0);
  };

  const extractText = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(0);
    setError('');
    setText('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data: { text: extracted } } = await worker.recognize(file);
      await worker.terminate();
      setText(extracted.trim());
      setStatus('done');
    } catch (err) {
      setError(err.message || 'OCR failed. Please try a clearer image.');
      setStatus('idle');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = text ? text.match(/\S+/g)?.length || 0 : 0;

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        className={file
          ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer'
          : 'border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors'}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg mx-auto object-contain" />
            <p className="font-medium text-slate-900 mt-3">{file.name}</p>
            <p className="text-xs text-indigo-500 mt-1">Click to change image</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">👁️</div>
            <p className="font-medium text-slate-700">Drop an image here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP, BMP, TIFF — max 20MB</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
        💡 Best results with clear, high-contrast printed text. Handwriting may have lower accuracy.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Progress */}
      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
          <p className="text-sm font-medium text-slate-700">
            {progress === 0 ? 'Initializing OCR engine…' : `Recognizing text… ${progress}%`}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">This may take 10–30 seconds depending on image size.</p>
        </div>
      )}

      <button
        onClick={extractText}
        disabled={!file || status === 'processing'}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {status === 'processing' && (
          <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
        )}
        {status === 'processing' ? 'Extracting…' : 'Extract Text'}
      </button>

      {/* Result */}
      {status === 'done' && text && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Extracted Text</p>
              <p className="text-xs text-slate-400 mt-0.5">{wordCount} words extracted</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copy}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 transition-colors">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={downloadTxt}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 transition-colors">
                ⬇ Download .txt
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={text}
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 resize-none focus:outline-none"
          />
        </div>
      )}

      {status === 'done' && !text && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
          No text found in this image. Try a clearer image with visible printed text.
        </div>
      )}
    </div>
  );
}
