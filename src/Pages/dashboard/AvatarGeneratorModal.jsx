import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2, Download, Check, Save } from 'lucide-react';

const SKIN_TONES = [
  "Type I - Very Fair / أبيض فاتح جداً", "Type II - Fair / أبيض فاتح",
  "Type III - Medium / قمحي فاتح", "Type IV - Olive / قمحي",
  "Type V - Brown / أسمر", "Type VI - Dark Brown / أسمر داكن",
];
const FACE_SHAPES = ["Oval / بيضاوي", "Round / مستدير", "Square / مربع", "Heart / قلب", "Oblong / مستطيل"];
const EYE_COLORS = ["Brown / بني", "Black / أسود", "Green / أخضر", "Blue / أزرق", "Hazel / عسلي"];
const EYEBROW_SHAPES = ["Thick / سميكة", "Thin / رفيعة", "Arched / مقوسة", "Straight / مستقيمة"];
const GLASSES_OPTIONS = ["None / بدون", "Prescription glasses / نظارات طبية", "Sunglasses / نظارات شمسية"];
const F_BODY_SHAPES = ["Hourglass", "Pear", "Rectangle", "Apple", "Inverted Triangle"];
const F_HAIR_OPTIONS = ["Long straight hair / شعر طويل أملس", "Short hair / شعر قصير", "Curly hair / شعر مجعد", "Wearing a neat hijab / طرحة أنيقة", "Wearing a turban / توربان"];
const M_BODY_SHAPES = ["Trapezoid (Athletic)", "Inverted Triangle", "Rectangle", "Oval", "Triangle"];
const M_HAIR_OPTIONS = ["Short hair / شعر قصير", "Short hair with beard / شعر قصير مع لحية", "Bald / أصلع", "Bald with beard / أصلع مع لحية", "Curly hair / شعر مجعد", "Curly hair with beard / شعر مجعد مع لحية"];

const API_BASE = import.meta.env.VITE_AVATAR_API_URL;

// Custom Select dropdown for beautiful options selection
function CustomSelect({ value, options, onChange, disabled }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-left text-sm text-white focus:outline-none focus:border-[#7c3aed] transition-all flex items-center justify-between hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate pr-2">{value}</span>
        <svg
          className={`w-4 h-4 text-white/50 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#7c3aed]' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full bg-slate-900 border border-white/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl animate-fade-in max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-all flex items-center justify-between border-b border-white/5 last:border-b-0 hover:bg-white/10 ${
                opt === value
                  ? 'bg-[#7c3aed]/20 text-[#c084fc] font-bold border-l-4 border-[#7c3aed]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="truncate pr-2">{opt}</span>
              {opt === value && (
                <svg className="w-4 h-4 text-[#c084fc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvatarGeneratorModal({ isOpen, onClose, onUseAvatar, defaultGender }) {
  const [activeTab, setActiveTab] = useState('demographics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [currentSeed, setCurrentSeed] = useState(0);

  // Form State
  const [gender, setGender] = useState(defaultGender === 'male' ? "Male / ذكر" : "Female / أنثى");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(65);
  const [skinTone, setSkinTone] = useState("Type IV - Olive / قمحي");
  
  const [faceShape, setFaceShape] = useState("Oval / بيضاوي");
  const [eyeColor, setEyeColor] = useState("Brown / بني");
  const [eyebrows, setEyebrows] = useState("Thick / سميكة");
  const [glasses, setGlasses] = useState("None / بدون");

  const [fBodyShape, setFBodyShape] = useState("Hourglass");
  const [fBust, setFBust] = useState(90);
  const [fWaist, setFWaist] = useState(70);
  const [fHips, setFHips] = useState(95);
  const [fHair, setFHair] = useState("Wearing a neat hijab / طرحة أنيقة");

  const [mBodyShape, setMBodyShape] = useState("Trapezoid (Athletic)");
  const [mChest, setMChest] = useState(100);
  const [mWaist, setMWaist] = useState(85);
  const [mThigh, setMThigh] = useState(55);
  const [mHair, setMHair] = useState("Short hair with beard / شعر قصير مع لحية");

  const [seedMode, setSeedMode] = useState("عشوائي (شخصية جديدة)");
  const [lastSeedState, setLastSeedState] = useState(0);

  if (!isOpen) return null;

  const isFemale = gender === "Female / أنثى";

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        data: [
          gender, age, height, weight, skinTone,
          faceShape, eyeColor, eyebrows, glasses,
          fBodyShape, fBust, fWaist, fHips, fHair,
          mBodyShape, mChest, mWaist, mThigh, mHair,
          seedMode, lastSeedState
        ]
      };

      const postResponse = await fetch(`${API_BASE}/gradio_api/call/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify(payload)
      });

      if (!postResponse.ok) throw new Error("API Request Failed. Check if the python server is running on Kaggle/Ngrok.");
      
      const { event_id } = await postResponse.json();
      if (!event_id) throw new Error("No event_id returned from server.");

      // Poll SSE endpoint
      const sseResponse = await fetch(`${API_BASE}/gradio_api/call/generate/${event_id}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      
      if (!sseResponse.body) throw new Error("Failed to read server stream.");

      const reader = sseResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let finalData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        
        for (const ev of events) {
          const lines = ev.split("\n");
          let eventType = "";
          let eventData = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.substring(7).trim();
            if (line.startsWith("data: ")) eventData = line.substring(6).trim();
          }
          
          if (eventType === "complete") {
            finalData = JSON.parse(eventData);
            break;
          } else if (eventType === "error") {
            throw new Error("Gradio API Error: " + eventData);
          }
        }
        if (finalData) break;
      }

      if (!finalData) throw new Error("Generation was incomplete or interrupted.");
      
      const outData = finalData;
      if (!outData || outData.length < 4) throw new Error("Invalid API Response format.");
      
      let imgUrl = outData[0];
      if (typeof imgUrl === 'object' && imgUrl.url) {
        imgUrl = imgUrl.url;
      }
      
      // Ensure absolute
      if (imgUrl && imgUrl.startsWith("/")) {
        imgUrl = API_BASE + imgUrl;
      }

      // Fetch the image as a Blob to bypass Ngrok's browser warning for <img> and <a> tags
      const imgFetch = await fetch(imgUrl, { headers: { "ngrok-skip-browser-warning": "true" } });
      if (!imgFetch.ok) throw new Error("Failed to download generated image from Ngrok.");
      const imgBlob = await imgFetch.blob();
      const localUrl = URL.createObjectURL(imgBlob);

      setResultImage(localUrl);
      const newSeed = outData[3];
      setCurrentSeed(newSeed);
      setLastSeedState(newSeed);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseAvatar = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage, { headers: { "ngrok-skip-browser-warning": "true" } });
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result;
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        onUseAvatar({ file: file, preview: resultImage, b64: b64 });
        onClose();
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      onUseAvatar({ file: null, preview: resultImage, b64: null });
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-slate-950/60 backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden shadow-2xl h-auto max-h-[95vh] md:h-[85vh] scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Left Side: Form Controls */}
        <div className="w-full md:flex-1 flex flex-col h-auto md:h-full md:border-r border-white/10 bg-transparent relative">
          
          {/* Sticky Header & Tabs */}
          <div className="p-6 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                <Sparkles size={20} className="text-[#7c3aed]" />
                Create Avatar
              </h2>
              <button onClick={onClose} className="md:hidden text-white/50 hover:text-white"><X size={20} /></button>
            </div>

            {/* Form Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scroll">
              {['demographics', 'body', 'face', 'specifics'].map(tab => (
                <button 
                  key={tab} 
                  disabled={loading}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : 'text-white/50 hover:text-white hover:bg-white/5'} ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scroll px-6 py-2">
            <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {activeTab === 'demographics' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Gender</label>
                  <div className="flex gap-2">
                    <button onClick={() => setGender("Female / أنثى")} className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold transition-colors ${isFemale ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>Female</button>
                    <button onClick={() => setGender("Male / ذكر")} className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold transition-colors ${!isFemale ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>Male</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Age: {age}</label>
                  <input type="range" min="15" max="80" value={age} onChange={e => setAge(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                </div>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Height: {height} cm</label>
                  <input type="range" min="130" max="220" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Weight: {weight} kg</label>
                  <input type="range" min="35" max="180" value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Skin Tone</label>
                  <CustomSelect value={skinTone} options={SKIN_TONES} onChange={setSkinTone} disabled={loading} />
                </div>
              </div>
            )}

            {activeTab === 'face' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Face Shape</label>
                  <CustomSelect value={faceShape} options={FACE_SHAPES} onChange={setFaceShape} disabled={loading} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Eye Color</label>
                  <CustomSelect value={eyeColor} options={EYE_COLORS} onChange={setEyeColor} disabled={loading} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Eyebrows</label>
                  <CustomSelect value={eyebrows} options={EYEBROW_SHAPES} onChange={setEyebrows} disabled={loading} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Glasses</label>
                  <CustomSelect value={glasses} options={GLASSES_OPTIONS} onChange={setGlasses} disabled={loading} />
                </div>
              </div>
            )}

            {activeTab === 'specifics' && (
              <div className="space-y-4 animate-fade-in">
                {isFemale ? (
                  <>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Body Shape</label>
                      <CustomSelect value={fBodyShape} options={F_BODY_SHAPES} onChange={setFBodyShape} disabled={loading} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Bust: {fBust} cm</label>
                      <input type="range" min="70" max="130" value={fBust} onChange={e => setFBust(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Waist: {fWaist} cm</label>
                      <input type="range" min="55" max="120" value={fWaist} onChange={e => setFWaist(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Hips: {fHips} cm</label>
                      <input type="range" min="75" max="140" value={fHips} onChange={e => setFHips(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Hair/Hijab</label>
                      <CustomSelect value={fHair} options={F_HAIR_OPTIONS} onChange={setFHair} disabled={loading} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Body Shape</label>
                      <CustomSelect value={mBodyShape} options={M_BODY_SHAPES} onChange={setMBodyShape} disabled={loading} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Chest: {mChest} cm</label>
                      <input type="range" min="80" max="140" value={mChest} onChange={e => setMChest(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Waist: {mWaist} cm</label>
                      <input type="range" min="60" max="130" value={mWaist} onChange={e => setMWaist(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Thighs: {mThigh} cm</label>
                      <input type="range" min="40" max="80" value={mThigh} onChange={e => setMThigh(parseInt(e.target.value))} className="w-full accent-[#7c3aed]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Hair/Beard</label>
                      <CustomSelect value={mHair} options={M_HAIR_OPTIONS} onChange={setMHair} disabled={loading} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
          <div className="p-6 pt-4 border-t border-white/10 flex-shrink-0 bg-transparent">
            {error && <div className="text-red-400 text-[10px] leading-tight mb-3 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-black uppercase tracking-[0.12em] py-2.5 md:py-4 text-xs md:text-sm rounded-xl md:rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#7c3aed]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Generating...</> : "Generate Avatar"}
            </button>
          </div>
        </div>

        {/* Right Side: Result */}
        <div className="w-full md:flex-1 bg-black/20 flex flex-col p-6 relative h-auto md:h-full">
          <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 text-white/50 hover:text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur-md transition-transform hover:scale-110"><X size={20} /></button>
          
          {/* Seed Mode (Consistency) */}
          <div className="mb-4 pr-0 md:pr-12">
            <label className="text-[10px] uppercase text-white/50 font-bold mb-2 block">Seed Mode (Consistency)</label>
            <div className="flex gap-2">
              <button 
                disabled={loading}
                onClick={() => setSeedMode("عشوائي (شخصية جديدة)")} 
                className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl border text-[10px] md:text-xs font-bold transition-all ${seedMode === "عشوائي (شخصية جديدة)" ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'border-white/10 text-white/50 hover:bg-white/5'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Random (New)
              </button>
              <button 
                disabled={loading}
                onClick={() => setSeedMode("تثبيت (نفس الشخصية السابقة)")} 
                className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl border text-[10px] md:text-xs font-bold transition-all ${seedMode === "تثبيت (نفس الشخصية السابقة)" ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' : 'border-white/10 text-white/50 hover:bg-white/5'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Keep Character
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[320px] md:min-h-0 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 size={40} className="text-[#7c3aed] animate-spin mb-4" />
                <p className="text-white/50 text-sm animate-pulse font-bold tracking-widest uppercase">Painting Avatar...</p>
              </div>
            ) : resultImage ? (
              <img src={resultImage} alt="Generated Avatar" className="w-full h-full object-contain animate-fade-in" />
            ) : (
              <div className="text-center p-6">
                <Sparkles size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/50 text-sm">Your generated avatar will appear here.</p>
              </div>
            )}
          </div>

          {resultImage && !loading && (
            <div className="mt-4 flex gap-3 animate-fade-in">
              <a 
                href={resultImage} 
                download="my_avatar.png"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center transition-all"
              >
                <Download size={14} className="mr-1.5" /> Save
              </a>
              <button 
                onClick={handleUseAvatar}
                className="flex-[2] bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest text-[10px] md:text-xs py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-lg shadow-[#7c3aed]/30"
              >
                <Check size={14} className="mr-1.5" /> Use for Try-On
              </button>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
