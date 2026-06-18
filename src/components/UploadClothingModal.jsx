import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Check,
  Loader2,
  ImagePlus,
  Tag,
  Palette,
  Plus,
} from 'lucide-react';
import { classifyClothing } from '../services/classifierService';
import { createCustomItem } from '../services/wardrobeService';
import { trackModelUsage } from '../services/userService';
import toast from 'react-hot-toast';

/* ───────── animation presets ───────── */
const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 340 },
  },
  exit: { opacity: 0, scale: 0.92, y: 30, transition: { duration: 0.2 } },
};

const page = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

/* ───────── constants ───────── */
const SEASONS = ['spring', 'summer', 'fall', 'winter'];

const PROCESSING_STEPS = [
  'Removing background…',
  'Analyzing clothing…',
  'Generating classification…',
];

const emptyForm = {
  category: '',
  subcategory: '',
  gender: '',
  material: '',
  pattern: '',
  fit: '',
  sleeve: '',
  colors: [],
  season: [],
  description: '',
};

/* ───────── helper: file → base64 ───────── */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ───────── save API call (uses wardrobeService.createCustomItem) ───────── */
const saveCustomItem = async (itemData) => createCustomItem(itemData);

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function UploadClothingModal({ isOpen, onClose, onSaved }) {
  /* state */
  const [step, setStep] = useState('upload'); // upload | preview | processing | results | success
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [colorInput, setColorInput] = useState('');
  const [processingIdx, setProcessingIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef(null);

  /* ── reset ── */
  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setForm(emptyForm);
    setColorInput('');
    setProcessingIdx(0);
    setIsDragging(false);
    setSaving(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  /* ── file handling ── */
  const handleFile = useCallback(async (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    setFile(f);
    const dataUrl = await toBase64(f);
    setPreview(dataUrl);
    setStep('preview');
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  /* ── classify ── */
  const handleClassify = useCallback(async () => {
    if (!file) return;
    setStep('processing');
    setProcessingIdx(0);

    // Animate through processing steps
    const timers = PROCESSING_STEPS.map(
      (_, i) =>
        i > 0 &&
        setTimeout(() => setProcessingIdx(i), i * 1800)
    );

    try {
      const data = await classifyClothing(file);

      // Normalise API response into form shape
      const classification = data.classification || data;
      const colors = Array.isArray(classification.colors)
        ? classification.colors
        : typeof classification.colors === 'string'
          ? classification.colors.split(',').map((c) => c.trim()).filter(Boolean)
          : [];

      const season = Array.isArray(classification.season)
        ? classification.season.map((s) => s.toLowerCase())
        : typeof classification.season === 'string'
          ? classification.season.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [];

      // Normalize gender from API response (male→men, female→women, unisex→unisex)
      let normalizedGender = classification.gender || '';
      if (normalizedGender.toLowerCase() === 'male') normalizedGender = 'men';
      else if (normalizedGender.toLowerCase() === 'female') normalizedGender = 'women';
      else if (normalizedGender.toLowerCase() === 'unisex') normalizedGender = 'unisex';

      setForm({
        category: classification.category || '',
        subcategory: classification.subcategory || '',
        gender: ['men', 'women', 'unisex'].includes(normalizedGender)
          ? normalizedGender
          : '',
        material: classification.material || '',
        pattern: classification.pattern || '',
        fit: classification.fit || '',
        sleeve: classification.sleeve || '',
        colors,
        season,
        description: classification.description || '',
      });

      // processed (bg-removed) image – the API returns it in imageBase64
      setProcessedImage(
        data.imageBase64
          ? data.imageBase64.startsWith('data:')
            ? data.imageBase64
            : `data:image/png;base64,${data.imageBase64}`
          : preview
      );

      setStep('results');
      try {
        await trackModelUsage('classification');
      } catch (trackingError) {
        console.warn('Classification usage tracking failed:', trackingError);
      }
    } catch (err) {
      toast.error(err.message || 'Classification failed. Please try again.');
      setStep('preview');
    } finally {
      timers.forEach((t) => t && clearTimeout(t));
    }
  }, [file, preview]);

  /* ── save ── */
  const handleSave = useCallback(async () => {
    if (!form.category?.trim() || !['men', 'women', 'unisex'].includes(form.gender)) {
      toast.error('Please choose a valid category and gender before saving.');
      return;
    }

    setSaving(true);
    try {
      const originalBase64 = processedImage || preview;

      if (!originalBase64) {
        toast.error('Please upload an image before saving.');
        return;
      }
      
      // Compress the image before sending to avoid 413 Payload Too Large
      const compressImage = (base64Str) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_SIZE = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // output as jpeg to save space (0.7 quality)
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.onerror = () => resolve(base64Str);
          img.src = base64Str;
        });
      };

      const imageBase64 = await compressImage(originalBase64);

      await saveCustomItem({ ...form, imageBase64 });
      setStep('success');
      toast.success('Item saved to your wardrobe!');
      setTimeout(() => {
        onSaved?.();
        handleClose();
      }, 1600);
    } catch (err) {
      toast.error(err.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  }, [form, processedImage, preview, onSaved, handleClose]);

  /* ── form helpers ── */
  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addColor = () => {
    const c = colorInput.trim().toLowerCase();
    if (c && !form.colors.includes(c)) {
      updateField('colors', [...form.colors, c]);
    }
    setColorInput('');
  };

  const removeColor = (color) =>
    updateField(
      'colors',
      form.colors.filter((c) => c !== color)
    );

  const toggleSeason = (s) =>
    updateField(
      'season',
      form.season.includes(s) ? form.season.filter((v) => v !== s) : [...form.season, s]
    );

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-slate-950/50 shadow-2xl scrollbar-thin scrollbar-thumb-white/10"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── close btn ── */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full  text-gray-400 transition hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* ═══════ UPLOAD STATE ═══════ */}
                {step === 'upload' && (
                  <motion.div key="upload" {...page} className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">Upload Clothing</h2>
                      <p className="text-sm text-gray-400">
                        Add a photo and our AI will classify it for your wardrobe
                      </p>
                    </div>

                    <div
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => inputRef.current?.click()}
                      className={`group relative flex flex-col items-center justify-center gap-4 rounded-[26px] p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragging
                          ? 'bg-violet-500/10 scale-[1.02]'
                          : 'bg-white/[0.05] hover:bg-white/10'
                      }`}
                    >
                      <motion.div
                        animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="rounded-full  p-4"
                      >
                        <ImagePlus className="size-8 text-violet-400" />
                      </motion.div>

                      <div className="space-y-1">
                        <p className="text-white font-medium">
                          {isDragging ? 'Drop your image here' : 'Drag & drop your clothing photo'}
                        </p>
                        <p className="text-sm text-gray-400">or click to browse · PNG, JPG, WebP</p>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-full  px-4 py-2 text-xs font-medium text-gray-300 transition  group-hover:text-violet-300">
                        <Camera className="size-3.5" />
                        Select Image
                      </span>

                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl p-4 text-sm text-gray-400">
                      <Sparkles className="size-5 shrink-0 text-violet-400 mt-0.5" />
                      <p>
                        For best results, use a well-lit photo with a clean background.
                        Our AI will remove the background and classify the clothing automatically.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ PREVIEW STATE ═══════ */}
                {step === 'preview' && (
                  <motion.div key="preview" {...page} className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">Preview</h2>
                      <p className="text-sm text-gray-400">
                        Make sure the clothing item is clearly visible
                      </p>
                    </div>

                    <div className="relative mx-auto max-w-xs overflow-hidden rounded-[26px] border border-white/10">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-72 object-contain"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          setStep('upload');
                        }}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Change Image
                      </button>
                      <button
                        onClick={handleClassify}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 hover:brightness-110"
                      >
                        <Sparkles className="size-4" />
                        Classify with AI
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ PROCESSING STATE ═══════ */}
                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    {...page}
                    className="flex flex-col items-center justify-center gap-8 py-16"
                  >
                    {/* spinner */}
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        className="absolute size-24 rounded-full border-2 border-violet-500/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute size-16 rounded-full border-2 border-indigo-500/40"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.5,
                        }}
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="size-10 text-violet-400" />
                      </motion.div>
                    </div>

                    {/* steps */}
                    <div className="space-y-3 text-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={processingIdx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          className="text-lg font-medium text-white"
                        >
                          {PROCESSING_STEPS[processingIdx]}
                        </motion.p>
                      </AnimatePresence>

                      <div className="flex items-center justify-center gap-2">
                        {PROCESSING_STEPS.map((_, i) => (
                          <motion.div
                            key={i}
                            className={`h-1.5 rounded-full transition-colors duration-500 ${
                              i <= processingIdx ? 'bg-violet-500' : 'bg-white/10'
                            }`}
                            animate={{ width: i <= processingIdx ? 32 : 12 }}
                            transition={{ duration: 0.4 }}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-500">This may take a moment…</p>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ RESULTS STATE ═══════ */}
                {step === 'results' && (
                  <motion.div key="results" {...page} className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">Classification Results</h2>
                      <p className="text-sm text-gray-400">
                        Review and edit the AI-generated details before saving
                      </p>
                    </div>

                    {/* processed image */}
                    <div className="mx-auto max-w-[200px] overflow-hidden rounded-[26px] ">
                      <img
                        src={processedImage || preview}
                        alt="Classified"
                        className="w-full h-52 object-contain"
                      />
                    </div>

                    {/* form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* category */}
                      <FormField label="Category" icon={<Tag className="size-3.5" />}>
                        <input
                          type="text"
                          value={form.category}
                          onChange={(e) => updateField('category', e.target.value)}
                          placeholder="e.g. Tops"
                          className={inputCls}
                        />
                      </FormField>

                      {/* subcategory */}
                      <FormField label="Subcategory" icon={<Tag className="size-3.5" />}>
                        <input
                          type="text"
                          value={form.subcategory}
                          onChange={(e) => updateField('subcategory', e.target.value)}
                          placeholder="e.g. T-Shirt"
                          className={inputCls}
                        />
                      </FormField>

                      {/* gender */}
                      <FormField label="Gender">
                        <select
                          value={form.gender}
                          onChange={(e) => updateField('gender', e.target.value)}
                          className={inputCls + ' appearance-none'}
                        >
                          <option value="">Select gender</option>
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </FormField>

                      {/* material */}
                      <FormField label="Material">
                        <input
                          type="text"
                          value={form.material}
                          onChange={(e) => updateField('material', e.target.value)}
                          placeholder="e.g. Cotton"
                          className={inputCls}
                        />
                      </FormField>

                      {/* pattern */}
                      <FormField label="Pattern">
                        <input
                          type="text"
                          value={form.pattern}
                          onChange={(e) => updateField('pattern', e.target.value)}
                          placeholder="e.g. Solid"
                          className={inputCls}
                        />
                      </FormField>

                      {/* fit */}
                      <FormField label="Fit">
                        <input
                          type="text"
                          value={form.fit}
                          onChange={(e) => updateField('fit', e.target.value)}
                          placeholder="e.g. Regular"
                          className={inputCls}
                        />
                      </FormField>

                      {/* sleeve */}
                      <FormField label="Sleeve">
                        <input
                          type="text"
                          value={form.sleeve}
                          onChange={(e) => updateField('sleeve', e.target.value)}
                          placeholder="e.g. Short Sleeve"
                          className={inputCls}
                        />
                      </FormField>
                    </div>

                    {/* colors */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gray-400">
                        <Palette className="size-3.5" />
                        Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {form.colors.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-gray-200"
                          >
                            {c}
                            <button
                              onClick={() => removeColor(c)}
                              className="ml-0.5 rounded-full p-0.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                            placeholder="Add color"
                            className="w-28 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition"
                          />
                          <button
                            type="button"
                            onClick={addColor}
                            className="absolute right-1 rounded-full p-1 text-gray-400 transition hover:text-violet-400"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* season */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Season
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SEASONS.map((s) => {
                          const active = form.season.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSeason(s)}
                              className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition ${
                                active
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* description */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        placeholder="Describe the item…"
                        className={inputCls + ' resize-none'}
                      />
                    </div>

                    {/* action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          reset();
                          setStep('upload');
                        }}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Try Another
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Upload className="size-4" />
                            Save to Wardrobe
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ SUCCESS STATE ═══════ */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    {...page}
                    className="flex flex-col items-center justify-center gap-6 py-20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30"
                    >
                      <Check className="size-10 text-white" strokeWidth={3} />
                    </motion.div>

                    <div className="text-center space-y-1">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Added to Wardrobe!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="text-sm text-gray-400"
                      >
                        Your item is ready to use in outfits
                      </motion.p>
                    </div>

                    {/* confetti dots */}
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute size-2 rounded-full"
                        style={{
                          background: ['#a78bfa', '#818cf8', '#6366f1', '#34d399'][i % 4],
                          top: `${30 + Math.random() * 40}%`,
                          left: `${15 + Math.random() * 70}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.2, 0],
                          y: [0, -(40 + Math.random() * 60)],
                        }}
                        transition={{ duration: 1.2, delay: 0.1 + i * 0.07 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────── shared input class ───────── */
const inputCls =
  'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

/* ───────── tiny sub-component ───────── */
function FormField({ label, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gray-400">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
