'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
];

export default function ImageCropper() {
  const [image, setImage] = useState(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(null);
  const [croppedUrl, setCroppedUrl] = useState('');
  const [displayScale, setDisplayScale] = useState(1);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setCroppedUrl('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const maxW = Math.min(600, containerRef.current?.clientWidth || 600);
        const scale = img.width > maxW ? maxW / img.width : 1;
        setDisplayScale(scale);
        const pad = 20;
        setCropRect({
          x: pad,
          y: pad,
          w: Math.round(img.width - pad * 2),
          h: Math.round(img.height - pad * 2),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dw = Math.round(image.width * displayScale);
    const dh = Math.round(image.height * displayScale);
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, dw, dh);

    const { x, y, w, h } = cropRect;
    const sx = x * displayScale, sy = y * displayScale;
    const sw = w * displayScale, sh = h * displayScale;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, dw, sy);
    ctx.fillRect(0, sy + sh, dw, dh - sy - sh);
    ctx.fillRect(0, sy, sx, sh);
    ctx.fillRect(sx + sw, sy, dw - sx - sw, sh);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    const handles = [
      [sx, sy], [sx + sw / 2, sy], [sx + sw, sy],
      [sx, sy + sh / 2], [sx + sw, sy + sh / 2],
      [sx, sy + sh], [sx + sw / 2, sy + sh], [sx + sw, sy + sh],
    ];
    ctx.fillStyle = '#fff';
    handles.forEach(([hx, hy]) => ctx.fillRect(hx - 4, hy - 4, 8, 8));
  }, [image, cropRect, displayScale]);

  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) / displayScale),
      y: Math.round((clientY - rect.top) / displayScale),
    };
  }, [displayScale]);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    setIsDragging(true);
    setDragStart(pos);
    setCropRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setCroppedUrl('');
  }, [getCanvasPos]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    let w = pos.x - dragStart.x;
    let h = pos.y - dragStart.y;
    if (aspectRatio) {
      const absW = Math.abs(w);
      const absH = Math.abs(h);
      if (absW / absH > aspectRatio) {
        h = Math.sign(h) * absW / aspectRatio;
      } else {
        w = Math.sign(w) * absH * aspectRatio;
      }
    }
    const x = w < 0 ? dragStart.x + w : dragStart.x;
    const y = h < 0 ? dragStart.y + h : dragStart.y;
    setCropRect({
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: Math.abs(w),
      h: Math.abs(h),
    });
  }, [isDragging, dragStart, getCanvasPos, aspectRatio]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const handleCrop = () => {
    if (!image || cropRect.w < 2 || cropRect.h < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropRect.w);
    canvas.height = Math.round(cropRect.h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
    setCroppedUrl(canvas.toDataURL('image/jpeg', 0.95));
  };

  return (
    <div className="space-y-5">
      {!image ? (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-10 text-center cursor-pointer transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="text-4xl mb-3">✂️</div>
          <p className="font-medium text-slate-700">Drop an image or click to browse</p>
          <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP, GIF supported</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-medium text-slate-700">Aspect Ratio:</span>
              {RATIOS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setAspectRatio(r.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${aspectRatio === r.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {r.label}
                </button>
              ))}
              <button
                onClick={() => { setImage(null); setCroppedUrl(''); }}
                className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Change image
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-2">Drag on the image to select the crop area</p>

            <div ref={containerRef} style={{ overflowX: 'auto' }}>
              <canvas
                ref={canvasRef}
                style={{ maxWidth: '100%', cursor: 'crosshair', display: 'block' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onMouseDown}
                onTouchMove={onMouseMove}
                onTouchEnd={onMouseUp}
              />
            </div>

            {cropRect.w > 0 && cropRect.h > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Selection: {Math.round(cropRect.w)} × {Math.round(cropRect.h)} px
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCrop}
              disabled={cropRect.w < 2}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✂️ Crop Image
            </button>
          </div>

          {croppedUrl && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              <p className="font-semibold text-green-800">Cropped preview</p>
              <img src={croppedUrl} alt="Cropped" className="max-h-64 rounded-lg object-contain border border-green-200" />
              <a
                href={croppedUrl}
                download="cropped.jpg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors inline-flex items-center gap-2"
              >
                ⬇️ Download Cropped Image
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
