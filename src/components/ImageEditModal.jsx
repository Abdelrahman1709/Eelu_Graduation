import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageEditModal({ isOpen, onClose, imageFile, aspect = '1:1', onSave, title = 'Edit Image' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(imageFile);
  const [imgSrc, setImgSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const animationFrameRef = useRef(null);

  const imageSource = currentFile || selectedFile;

  useEffect(() => {
    setCurrentFile(imageFile);
    setSelectedFile(null);
  }, [imageFile]);

  useEffect(() => {
    if (!imageSource) return setImgSrc(null);
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result);
    reader.onerror = () => setImgSrc(null);
    reader.readAsDataURL(imageSource);
  }, [imageSource]);

  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = imgSrc;
  }, [imgSrc, zoom, aspect, offset]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const parseAspect = (asp) => {
    const [w, h] = ('' + asp).split(':').map(Number);
    return { w: w || 1, h: h || 1 };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const { w: aW, h: aH } = parseAspect(aspect);
    const displayWidth = 800;
    const displayHeight = Math.round((displayWidth * aH) / aW);
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.max((canvas.width / img.width), (canvas.height / img.height)) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (canvas.width - drawW) / 2 + offset.x;
    const dy = (canvas.height - drawH) / 2 + offset.y;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, dx, dy, drawW, drawH);
  };

  const handleFileInput = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setSelectedFile(file);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDropZoneActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDropZoneActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFileInput(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDropZoneActive(true);
  };

  const handleDragLeave = () => {
    setDropZoneActive(false);
  };

  const handleMouseDown = (event) => {
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    event.preventDefault?.();
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !dragStart) return;
    
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: clientX, y: clientY });
    });
    
    event.preventDefault?.();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleSave = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      toast.loading('Preparing image...');
      await onSave(dataUrl);
      toast.dismiss();
      toast.success('Image saved');
      onClose();
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Failed to save image');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 backdrop-blur-3xl" onClick={onClose} />
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative z-50 w-full max-w-xl md:max-w-2xl rounded-3xl border border-white/10  backdrop-blur-xl p-6 shadow-2xl shadow-black/40 mx-auto max-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center gap-3">
                {imageSource ? (
                  <>
                    <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-xl">
                  <canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: 'auto', maxHeight: 420, cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-sm text-slate-300">Zoom</label>
                      <input type="range" min="0.6" max="2" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
                    </div>
                  </>
                ) : (
                  <div
                    className={`group rounded-3xl border-2 border-dashed p-12 text-center transition ${dropZoneActive ? 'border-violet-400 bg-white/10' : 'border-white/20 bg-transparent'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="mx-auto mb-4 h-20 w-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-300">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-semibold text-white">Drag & drop your photo here</p>
                    <p className="mt-2 text-sm text-slate-400">Or click to browse and start cropping.</p>
                    <label className="mt-5 inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                      Select Photo
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileInput(e.target.files?.[0])} />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Aspect Ratio</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setZoom(1) || null} className="px-3 py-1 rounded-lg border border-white/10 text-sm">Reset Zoom</button>
                    <button onClick={() => { setZoom(1); setOffset({ x:0, y:0 }); }} className="px-3 py-1 rounded-lg border border-white/10 text-sm">Reset Position</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Instructions</p>
                  <p className="text-sm text-slate-400">Drag the image inside the preview to reposition, then use zoom to fit the crop. The final result is what will be uploaded.</p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button onClick={handleSave} disabled={!imageSource} className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Save Image</button>
                  <button onClick={() => { setCurrentFile(null); setSelectedFile(null); setZoom(1); setOffset({ x:0, y:0 }); }} className="w-full py-3 rounded-lg border border-white/10 text-white font-semibold">Choose Another Photo</button>
                </div>

                <div className="text-xs text-slate-500">Tip: For best results, use a high-resolution image.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

