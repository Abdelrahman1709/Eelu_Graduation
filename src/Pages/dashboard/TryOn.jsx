import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Camera,
  RefreshCw,
  ShieldCheck,
  ScanLine,
  MoveHorizontal,
  Bot,
  Cpu,
  AlertCircle,
  Loader2,
  Thermometer,
  Calendar,
  Clock,
  Shirt,
  Sparkles,
  X,
  Check,
  MapPin,
  Menu,
} from "lucide-react";
import sampleMen1 from "../../assets/TestTryOn/men1.avif";
import sampleMen2 from "../../assets/TestTryOn/men2.avif";
import sampleMen3 from "../../assets/TestTryOn/men3.avif";
import sampleGirl1 from "../../assets/TestTryOn/girl1.avif";
import sampleGirl2 from "../../assets/TestTryOn/girl2.avif";
import sampleGirl3 from "../../assets/TestTryOn/girl3.avif";
import { useAuth } from "../../context/AuthContext";
import { useNavbar } from "../../context/NavbarContext";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { trackModelUsage } from "../../services/userService";
import { getWardrobe } from "../../services/wardrobeService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { createPortal } from "react-dom";
import AvatarGeneratorModal from "./AvatarGeneratorModal";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

// Wardrobe loading uses the shared wardrobe service to preserve auth refresh behavior.

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function extractJSON(rawText) {
  if (!rawText) throw new Error("Empty AI response");
  const cleaned = String(rawText).trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) { }
  const braceMatch = cleaned.match(/\{[\s\S]*\}/);
  if (braceMatch)
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) { }
  throw new Error("Invalid AI format");
}

function getWeatherDesc(code) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  return "Stormy";
}

function getWeatherEmoji(desc) {
  const map = {
    Clear: "☀️",
    Cloudy: "⛅",
    Foggy: "🌫️",
    Rainy: "🌧️",
    Snowy: "❄️",
    Showers: "🌦️",
    Stormy: "⛈️",
  };
  return map[desc] || "🌡️";
}

function getItemImage(item) {
  return (
    item?.imageUrl ||
    item?.image_url ||
    item?.image ||
    item?.photo ||
    item?.thumbnail ||
    item?.source ||
    null
  );
}
function getItemName(item, fallback = "Unnamed") {
  return (
    item?.name ||
    item?.title ||
    item?.item_name ||
    item?.description ||
    item?.subcategory ||
    item?.category ||
    fallback
  );
}
function getItemType(item) {
  return (
    item?.type || item?.category || item?.item_type || item?.subcategory || ""
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE/AFTER SLIDER  — portrait ratio, full image visible
// ─────────────────────────────────────────────────────────────────────────────

const BeforeAfterSlider = ({ before, after, loading, flipAfter = false }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    // Animate handle while processing
    if (loading) {
      let dir = 1;
      setPosition(0);
      animRef.current = setInterval(() => {
        setPosition((p) => {
          let next = p + dir * 6;
          if (next >= 100) {
            next = 100;
            dir = -1;
          } else if (next <= 0) {
            next = 0;
            dir = 1;
          }
          return next;
        });
      }, 60);
    }

    return () => {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    };
  }, [loading]);

  if (!before)
    return (
      <div className="w-full aspect-[3/4] max-w-xs mx-auto flex flex-col items-center justify-center opacity-20 gap-4 rounded-3xl">
        <Camera size={36} />
        <span className="text-xs uppercase tracking-widest font-bold text-white text-center px-6">
          Upload your photo to see the magic
        </span>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xs mx-auto  aspect-[3/4] rounded-3xl overflow-hidden bg-black shadow-2xl select-none"
    >
      {/* Base Original Image (always visible underneath) */}
      <img
        src={before}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        alt="Original"
        draggable={false}
      />

      {/* AI Result Overlay */}
      {after && (
        <img
          src={after}
          className="absolute inset-0 w-full h-full object-contain"
          alt="AI Result"
          draggable={false}
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        />
      )}

      {/* Loading overlay effect */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}

      {/* Invisible range input (kept for accessibility) */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      {/* Moving handle shown during loading or when a result is present */}
      {(loading || after) && (
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="w-9 h-9 -ml-4 rounded-full bg-white shadow-[0_0_20px_rgba(124,58,237,0.9)] flex items-center justify-center border-4 border-[#070514]">
            <MoveHorizontal size={14} className="text-[#7c3aed]" />
          </div>
        </div>
      )}

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[9px] uppercase font-bold text-white border border-white/10 z-10 pointer-events-none">
        Original
      </div>
      {after && !loading && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#7c3aed]/90 backdrop-blur-sm text-[9px] uppercase font-bold text-white z-10 pointer-events-none">
          AI Result
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WARDROBE ITEM CARD
// ─────────────────────────────────────────────────────────────────────────────

const WardrobeItemCard = ({ item, selected, onToggle }) => {
  const name = getItemName(item);
  const type = getItemType(item);
  const image = getItemImage(item);

  return (
    <div
      onClick={() => onToggle(item)}
      className={`flex gap-2 md:gap-3 p-2.5 md:p-3 rounded-2xl border transition-all cursor-pointer relative ${selected
        ? "bg-[#7c3aed]/15 border-[#7c3aed]/60 shadow-[0_0_14px_rgba(124,58,237,0.25)]"
        : "bg-white/[0.03] border-white/8 hover:border-[#7c3aed]/30 hover:bg-white/5"
        }`}
    >
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg z-10">
          <Check size={10} className="text-white" strokeWidth={3} />
        </div>
      )}
      <div className="w-12 md:w-14 h-12 md:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt={name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt size={16} className="text-white/20" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {type && (
          <span className="text-[8px] md:text-[9px] text-[#7c3aed] font-black uppercase tracking-widest truncate mb-0.5">
            {type}
          </span>
        )}
        <h4 className="text-[11px] md:text-[12px] font-bold text-white/90 leading-tight truncate">
          {name}
        </h4>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER BADGE
// ─────────────────────────────────────────────────────────────────────────────

const WeatherBadge = ({ weather, size = "md", showNoLocation = false, loading = false }) => {
  // If nothing to show and no request to show placeholder, return null
  if (!weather && !showNoLocation && !loading) return null;

  const baseClasses = `flex items-center gap-2 rounded-full font-bold uppercase tracking-widest ${size === "sm" ? "px-3 py-1 text-[9px]" : "px-4 py-2 text-[10px]"
    }`;

  if (loading) {
    return (
      <div className={`${baseClasses} border border-white/10 bg-white/5 text-white/60`}>
        <Loader2 size={size === "sm" ? 12 : 14} className="animate-spin" />
        <span>Getting weather information...</span>
      </div>
    );
  }

  if (showNoLocation && !weather) {
    return (
      <div className={`${baseClasses} border border-white/10 bg-white/5 text-white/40`}>
        <MapPin size={size === "sm" ? 12 : 14} />
        <span>No location selected</span>
      </div>
    );
  }

  const emoji = getWeatherEmoji(weather.desc);
  return (
    <div className={`${baseClasses} border border-[#7c3aed]/40 bg-[#7c3aed]/10 text-[#7c3aed]`}>
      <span>{emoji}</span>
      <span className="truncate">
        {weather.city} · {weather.temp}°C · {weather.desc}
      </span>
    </div>
  );
};

const ChatInput = ({ onSend, inputRef }) => {
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDraft("");
    await onSend(trimmed);
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 focus-within:border-[#7c3aed]/50 transition-all">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        className="flex-1 bg-transparent py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm outline-none text-white placeholder:text-white/20 font-medium"
        placeholder="Ask for suggestions..."
      />
      <button
        onClick={handleSend}
        disabled={!draft.trim()}
        className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] p-2 md:p-2.5 rounded-xl text-white active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Send size={14} />
      </button>
    </div>
  );
};

// Premium calendar + time picker (no raw inputs visible)
const DateTimePicker = ({ chosenDate, setChosenDate, chosenTime, setChosenTime, disabled }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth()); // 0-based
  const [tempDate, setTempDate] = useState(null);
  const [tempTime, setTempTime] = useState("");
  const ref = useRef(null);
  const modalRef = useRef(null);
  const timeListRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setTempDate(chosenDate ? new Date(`${chosenDate}T${chosenTime || '00:00'}`) : null);
      setTempTime(chosenTime || "");
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, chosenDate, chosenTime]);

  const startOfMonth = (y, m) => new Date(y, m, 1);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayWeekday = (y, m) => startOfMonth(y, m).getDay();

  const changeMonth = (delta) => {
    setViewMonth((current) => {
      const next = current + delta;
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  };

  const buildCalendar = () => {
    const days = [];
    const blanks = firstDayWeekday(viewYear, viewMonth);
    for (let i = 0; i < blanks; i++) days.push(null);
    const total = daysInMonth(viewYear, viewMonth);
    for (let d = 1; d <= total; d++) days.push(new Date(viewYear, viewMonth, d));
    return days;
  };

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const onSelectDate = (date) => {
    if (!date) return;
    if (date < minDate) return;
    setTempDate(date);
  };

  const times = [];
  const now = new Date();
  const isToday = tempDate && tempDate.toDateString() === today.toDateString();
  const currentHour = now.getHours();
  for (let h = 0; h < 24; h++) {
    if (isToday && h <= currentHour) continue; // Skip past/current hours for today
    times.push(`${String(h).padStart(2, '0')}:00`);
  }

  const commit = (time) => {
    if (!tempDate || !time) return;
    const yyyy = tempDate.getFullYear();
    const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tempDate.getDate()).padStart(2, '0');
    setChosenDate(`${yyyy}-${mm}-${dd}`);
    setChosenTime(time);
    setTempTime("");
    setOpen(false);
  };

  // auto-scroll selected time into view inside modal
  useEffect(() => {
    if (!open) return;
    const el = timeListRef.current && timeListRef.current.querySelector(`[data-time="${tempTime}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [tempTime, open]);

  const display = () => {
    if (chosenDate && chosenTime) {
      const d = new Date(`${chosenDate}T${chosenTime}`);
      return (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">{d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[13px] text-white/70">{d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      );
    }
    return <span className="text-sm text-white/70">Select Date & Time</span>;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4" ref={modalRef}>
      <style>{`
    .time-scroll::-webkit-scrollbar{width:8px;height:8px}
    .time-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#7c3aed66,#4f46e566);border-radius:8px}
    .time-scroll{scrollbar-width:thin;scrollbar-color:#7c3aed66 transparent}

    @media (max-width:420px){
      .mobile-day{aspect-ratio:unset;height:56px}
      .mobile-time-grid{grid-template-columns:repeat(1,1fr)!important}
      .modal-content{padding-bottom:96px}
      .time-scroll{max-height:38vh}
    }
    `}</style>
      <div className="w-full max-w-3xl sm:mx-auto h-full sm:h-auto sm:max-h-none max-h-[96vh] overflow-auto sm:overflow-hidden rounded-none sm:rounded-[2rem] border border-white/10 bg-transparent shadow-2xl modal-content">
        <div className="flex items-start justify-between gap-3 border-b rounded-sm border-white/10 px-5 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#7c3aed]/80 font-semibold">Premium Forecast</div>
            <h2 className="mt-2 text-2xl font-black text-white">Choose a future date and time</h2>
            <p className="mt-1 text-sm text-white/60">We will use expected weather for AI outfit suggestions.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
            aria-label="Close date time picker"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-[1.4fr_1fr] px-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-semibold">{new Date(viewYear, viewMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="rounded-2xl text-lg px-3 py-2 text-white hover:text-white/40 transition-colors ease-linear"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="rounded-2xl text-lg px-3 py-2 text-white hover:text-white/40 transition-colors ease-linear"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[12px] text-white/60">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {buildCalendar().map((dt, idx) => {
                const isDisabled = !dt || dt < minDate;
                const isSelected = tempDate && dt && tempDate.toDateString() === dt.toDateString();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectDate(dt)}
                    disabled={isDisabled}
                    className={`aspect-square rounded-2xl mobile-day text-base sm:text-sm font-semibold transition ${isDisabled ? 'cursor-not-allowed text-white/20' : isSelected ? 'bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] text-white shadow-lg' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >
                    {dt ? dt.getDate() : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-[0.2em] text-white/60">Selected slot</div>
              {tempDate ? (
                <div className="relative rounded-3xl bg-transparent border border-white/40 p-4">
                  <div className="text-sm text-white/70">Date</div>
                  <div className="mt-1 text-lg font-bold text-white">{tempDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <button
                    type="button"
                    onClick={() => { setChosenDate(''); setChosenTime(''); setTempDate(null); setTempTime(''); }}
                    className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 transition ease-linear "
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/60">Tap a future date to continue.</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-[0.2em] text-white/60">Pick hour</div>
                <div className="text-xs text-white/50">Current: {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}</div>
              </div>
              <div ref={timeListRef} className="time-scroll mobile-time-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-52 overflow-auto pr-1">
                {times.map((t) => {
                  const isSelected = tempTime === t;
                  return (
                    <button
                      key={t}
                      data-time={t}
                      type="button"
                      onClick={() => setTempTime(t)}
                      className={`rounded-2xl border px-3 py-3 text-base font-semibold transition ${isSelected ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-lg border-transparent' : 'bg-white/5 text-white border-white/10 hover:border-[#7c3aed] hover:bg-white/10'}`}
                    >
                      {new Date(`1970-01-01T${t}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div />
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Choose any future date; today and later only.</span>
                <button
                  type="button"
                  onClick={() => commit(tempTime)}
                  disabled={!tempDate || !tempTime}
                  className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${!tempDate || !tempTime ? ' text-white/40  border-white/6 cursor-not-allowed' : 'bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] text-white'}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile footer removed per UX request (duplicates) */}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        className={`w-full text-left px-4 py-3 rounded-2xl bg-gradient-to-r from-black/10 to-black/20 text-white flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-black/5 hover:to-black/25'}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-sm">
            <Calendar size={16} className="text-white" />
          </div>
          <div className="min-w-0">{display()}</div>
        </div>
        <div className="text-white/50">{chosenDate && chosenTime ? <Clock size={16} /> : null}</div>
      </button>
      {open && createPortal(modalContent, document.body)}
    </div>
  );
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE TAB BAR
// ─────────────────────────────────────────────────────────────────────────────

const MobileTabBar = ({ activeTab, setActiveTab, outfitCount }) => {

  const tabs = [
    { id: "chat", label: "Stylist", icon: Bot },
    { id: "wardrobe", label: "Wardrobe", icon: Shirt },
    { id: "tryon", label: "Try On", icon: Camera, badge: outfitCount },
  ];
  return (
    <div className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-transparent backdrop-blur-xl safe-area-bottom">
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative ${activeTab === id
            ? "text-[#7c3aed]"
            : "text-white/30 hover:text-white/60"
            }`}
        >
          <div className="relative">
            <Icon size={20} />
            {badge > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[8px] font-black flex items-center justify-center">
                {badge}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">
            {label}
          </span>
          {activeTab === id && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#7c3aed] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

function TryOn() {
  const { user } = useAuth();
  const [step, setStep] = useState("setup");
  const [event, setEvent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapPortalEl, setMapPortalEl] = useState(null);
  const [mapSelected, setMapSelected] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [wardrobe, setWardrobe] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [wardrobeFetched, setWardrobeFetched] = useState(false);
  const [wardrobeError, setWardrobeError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [outfit, setOutfit] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [userPhoto, setUserPhoto] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [vtoLoading, setVtoLoading] = useState(false);
  const [vtoLoadingText, setVtoLoadingText] = useState("");
  const [vtoResult, setVtoResult] = useState(null);

  const [activeTab, setActiveTab] = useState("chat");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Validation: consider city valid when it has at least 2 characters
  const cityValid = String(location || "").trim().length >= 2;
  // Forecast date/time selection
  const [chosenDate, setChosenDate] = useState("");
  const [chosenTime, setChosenTime] = useState("");
  const [forecastWeather, setForecastWeather] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const { setNavbarMode, hideNavbar, showNavbar } = useNavbar();

  // Determine sample images based on user gender
  const sampleImages = useMemo(() => {
    if (user?.gender && String(user.gender).toLowerCase() === "male") {
      return [sampleMen1, sampleMen2, sampleMen3];
    }
    return [sampleGirl1, sampleGirl2, sampleGirl3];
  }, [user?.gender]);

  // Monitor device size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Always keep the navbar visible on mobile for Try-On
  useEffect(() => {
    if (!isMobile) {
      setNavbarMode("auto");
      showNavbar();
      return;
    }

    setNavbarMode("always");
    showNavbar();
  }, [activeTab, isMobile, setNavbarMode, showNavbar]);

  useEffect(() => {
    const portal = document.createElement("div");
    portal.id = "itlala-map-portal";
    document.body.appendChild(portal);
    setMapPortalEl(portal);

    return () => {
      if (document.body.contains(portal)) {
        document.body.removeChild(portal);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to latest message disabled to prevent excessive scrolling during chat
    // chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (chosenDate && chosenTime && (cityValid || mapSelected)) {
      fetchForecastForSelected();
    }
  }, [chosenDate, chosenTime, cityValid, mapSelected]);

  // Removed Puter Init

  // Keep a ref of the photo to clean up ONLY on component unmount
  const previewRef = useRef(null);
  useEffect(() => {
    previewRef.current = userPhoto?.preview;
  }, [userPhoto]);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  // Fetch wardrobe
  useEffect(() => {
    if (step !== "chat") return;
    (async () => {
      setWardrobeLoading(true);
      setWardrobeError(null);
      try {
        setWardrobe(await getWardrobe());
      } catch (err) {
        setWardrobeError(err.message || "Could not load wardrobe");
      } finally {
        setWardrobeLoading(false);
        setWardrobeFetched(true);
      }
    })();
  }, [step]);

  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () =>
        setUserPhoto({
          preview: URL.createObjectURL(file),
          b64: ev.target.result,
        });
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleChangeLocation = () => {
    setLocation("");
    setSelectedCoords(null);
    setMapSelected(false);
    setWeather(null);
    setForecastWeather(null);
  };

  // ── Weather ────────────────────────────────────────────────────────────────

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error("Reverse geocode failed");
      const data = await res.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.county || address.state;
      const region = address.state || address.region || address.country;
      if (city && region) return `${city}, ${region}`;
      if (city) return city;
      if (region) return region;
      return data.display_name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    } catch {
      return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    }
  }, []);

  const fetchWeather = async (coords) => {
    setMapSelected(Boolean(coords));
    setWeatherLoading(true);
    try {
      let lat;
      let lon;
      let name;
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
        name = await reverseGeocode(lat, lon);
      } else {
        if (!location.trim()) return;
        setMapSelected(false);
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`,
        );
        const geo = await geoRes.json();
        if (!geo.results?.length) throw new Error("City not found");
        const result = geo.results[0];
        lat = result.latitude;
        lon = result.longitude;
        name = result.name;
      }

      const wx = await (
        await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        )
      ).json();
      setSelectedCoords({ lat, lng: lon });
      const cityName = name || location || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
      setLocation(cityName);
      setWeather({
        city: cityName,
        temp: Math.round(wx.current_weather.temperature),
        desc: getWeatherDesc(wx.current_weather.weathercode),
      });

      // Clear any previous forecast when user fetches current weather
      setForecastWeather(null);
    } catch {
      setWeather({ city: location || "Selected location", temp: 22, desc: "Clear" });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleMapClick = async (latlng) => {
    const coords = { latitude: latlng.lat, longitude: latlng.lng };
    setSelectedCoords({ lat: coords.latitude, lng: coords.longitude });
    setLocation("Loading location...");
    await fetchWeather(coords);
    // Clear forecast selection when user picks a new map location
    setForecastWeather(null);
  };

  // ── AI ─────────────────────────────────────────────────────────────────────

  const callAI = async (history, currentOutfitIds = [], effectiveWeather = weather) => {
    try {
      const isFirstMessage = history.length <= 1;
      const list = wardrobe.map((w, i) => {
        const id = w.id ?? w._id;
        const name = getItemName(w, "Item " + i);
        const category = w.category || "";
        const subcategory = w.subcategory || "";
        const type = `${category} ${subcategory}`.trim() || w.type || "";
        const colors = Array.isArray(w.colors) ? w.colors.join(", ") : (w.colors || "");
        const season = Array.isArray(w.season) ? w.season.join(", ") : (w.season || "");
        const fit = w.fit || "";
        const pattern = w.pattern || "";
        const material = w.material || "";
        const sleeve = w.sleeve || "";
        const description = w.description || "";
        return `ID: ${id} | Name: ${name} | Type: ${type} | Colors: ${colors} | Season: ${season} | Fit: ${fit} | Pattern: ${pattern} | Material: ${material} | Sleeve: ${sleeve} | Desc: ${description}`;
      }).join("\n");

      const systemInstruction = `You are "Itlala AI", the world's most elite luxury fashion stylist and color-matching expert.
You MUST reply in RAW JSON format ONLY. The JSON must have exactly two keys: "message" and "outfitIds".

LANGUAGE RULES:
- If the user speaks Arabic, you MUST reply entirely in Arabic (friendly, stylish, and professional). Otherwise, use English.

STYLING & LOGIC RULES:
1. USER PROFILE: You are styling a ${user?.gender || "person"}. Pay strict attention to this gender and ensure all recommendations are strictly culturally and practically appropriate for their gender and the given occasion. If the user is female and attending a formal event (like a wedding, gala, or party), you MUST prioritize recommending elegant dresses, skirts, or formal female attire over casual t-shirts or plain pants. If male, prioritize suits or formal shirts.
2. WARDROBE KNOWLEDGE: You have full access to the user's wardrobe below. Pay strict attention to "Type", "Colors", "Season", "Material", "Fit", "Pattern", "Sleeve", and "Desc".
3. COLOR THEORY: You are a master of color coordination. Never mix clashing colors. Use color wheel principles (complementary, analogous, neutral balancing).
4. STRICT WEATHER & SEASON LOGIC:
   - Current Weather context is provided below. Use this context silently to make smart clothing choices.
   - Speak naturally and conversationally.
   ${isFirstMessage ? `- Since this is the first message, you MUST enthusiastically greet the user by their name (${user?.name?.split(" ")[0] || "User"}) and briefly mention the exact temperature and city.` : "- Do NOT mention the temperature or city in your response."}
   - SUMMER/HOT (above 24°C): NEVER suggest heavy jackets, coats, sweaters, or winter wear. Choose breathable, light clothes.
   - WINTER/COLD (below 18°C): NEVER suggest only a t-shirt or shorts. You MUST suggest layering (e.g., a jacket/coat over a shirt) and long pants.
   - SPRING/FALL: Suggest medium layers or cardigans.
5. OUTFIT COMPOSITION:
   - Max 3 pieces.
   - You MUST select at least 2 pieces (a Top AND a Bottom) unless you are selecting a genuine Dress or Jumpsuit.
   - Do NOT lie or misrepresent an item to bypass rules (e.g., do not call shorts a dress). Every outfit must make logical sense.
6. DYNAMIC EDITS & VARIETY: 
   - CURRENT OUTFIT IDs: [${currentOutfitIds.join(", ")}].
   - If the user asks to add/remove a piece, modify the CURRENT OUTFIT accordingly.
   - CRITICAL: If the user asks for a "different outfit", "another option", or "something else", you MUST completely ignore the CURRENT OUTFIT IDs and pick entirely new items from the wardrobe. DO NOT repeat the same outfit.
7. STRICT DOMAIN GUARDRAIL:
   - You are exclusively a Fashion Stylist. If the user asks about ANY topic unrelated to fashion, clothing, styling, or their wardrobe (e.g., food recipes, politics, coding, general knowledge), you MUST politely refuse to answer.
   - Do NOT attempt to creatively connect off-topic questions to fashion (e.g., do not suggest an outfit for eating Shawarma if they ask for a recipe).
   - Simply reply in the user's language that you are an AI Fashion Stylist and can only assist with wardrobe and styling.

In "message", write a highly fashionable, engaging, and natural explanation of why you chose these pieces and how the colors match perfectly. Keep it conversational. Do NOT include item IDs in the text.
In "outfitIds", provide the FINAL array of EXACT item IDs for the outfit. ONLY use the ID part.

WARDROBE ITEMS:
${list}

CONTEXT:
${effectiveWeather ? `Exact Live Weather: ${effectiveWeather.temp}°C, ${effectiveWeather.desc} in ${effectiveWeather.city}.` : "Weather: Unknown (design for a balanced indoor climate)."}
${event ? `Occasion: ${event}.` : ""}`;

      const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(m => ({
          role: m.role === 'assistant' || m.role === 'ai' ? 'assistant' : 'user',
          content: m.content || m.text
        }))
      ];

      // ========== API KEYS LIST ==========
      // You can add more API keys to this array. Just put them in quotes and separate by commas.
      const rawGroqKeys = import.meta.env.VITE_GROQ_API_KEYS || "";
      const apiKeys = [
        import.meta.env.VITE_GROQ_API_KEY,
        ...rawGroqKeys.split(',').map(k => k.trim())
      ].filter(Boolean); // Filters out empty or undefined keys

      let response;
      let data;
      let apiSuccess = false;
      let lastError;

      for (const key of apiKeys) {
        try {
          response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${key}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: messages,
              response_format: { type: "json_object" },
              temperature: 0.7,
              top_p: 1,
              max_completion_tokens: 1024
            })
          });

          data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || "API Error");

          apiSuccess = true;
          break; // If successful, exit the loop and continue with data
        } catch (error) {
          console.warn("API key failed, trying next one...", error.message || error);
          lastError = error;
        }
      }

      if (!apiSuccess) {
        throw new Error(lastError?.message || "All API keys failed.");
      }

      const text = data.choices[0].message.content;
      const parsed = extractJSON(text);

      const suggestedIds = parsed.outfitIds || [];
      const items = suggestedIds.map(id => wardrobe.find(w => String(w.id ?? w._id) === String(id))).filter(Boolean);

      const result = {
        message: parsed.message,
        items: items,
      };

      try {
        await trackModelUsage("recommendation");
      } catch (trackingError) {
        console.warn("Recommendation usage tracking failed:", trackingError);
      }

      return result;
    } catch (err) {
      console.error("AI Error:", err);
      return {
        message: "Here's a curated selection for today.",
        items: [...wardrobe].sort(() => 0.5 - Math.random()).slice(0, 3),
      };
    }
  };

  // Initial recommendation after wardrobe loads
  useEffect(() => {
    if (step === "chat" && messages.length === 0 && wardrobeFetched) {
      if (wardrobe.length === 0) {
        const firstName = user?.name?.split(" ")[0] || "there";
        setMessages([
          {
            role: "ai",
            text: `Welcome, ${firstName}! I see your wardrobe is empty right now. Please add some clothes so I can help you put together the perfect outfit!`
          }
        ]);
        return;
      }

      (async () => {
        setAiLoading(true);
        const effectiveWeather = forecastWeather || weather;
        const prompt = [
          "I need an outfit recommendation.",
          event ? `Occasion: ${event}.` : "",
          effectiveWeather
            ? `Weather: ${effectiveWeather.temp}°C and ${effectiveWeather.desc} in ${effectiveWeather.city}.`
            : "",
          "Suggest the best complete outfit from my wardrobe.",
        ]
          .filter(Boolean)
          .join(" ");
        const res = await callAI([{ role: "user", content: prompt }], [], effectiveWeather);
        setOutfit(res.items);
        setMessages([{ role: "ai", text: String(res.message) }]);
        setAiLoading(false);
      })();
    }
  }, [wardrobe, wardrobeFetched, step, forecastWeather, weather, event, user]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    inputRef.current?.focus();
    setAiLoading(true);
    const next = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    const effectiveWeather = forecastWeather || weather;
    const res = await callAI(
      next.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      })),
      outfit.map((o) => o.id ?? o._id),
      effectiveWeather
    );
    if (res.items?.length) setOutfit(res.items);
    setMessages((prev) => [...prev, { role: "ai", text: String(res.message) }]);
    setAiLoading(false);
    inputRef.current?.focus();
  }, [messages, outfit]);

  const toggleItem = (item) => {
    const id = item.id ?? item._id;
    setOutfit((prev) =>
      prev.some((i) => (i.id ?? i._id) === id)
        ? prev.filter((i) => (i.id ?? i._id) !== id)
        : [...prev, item],
    );
  };

  const navigate = useNavigate();

  const randomOutfit = useCallback(() => {
    if (!wardrobe.length) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>No items in wardrobe.</span>
          <button
            onClick={() => navigate("/features/wardrobe")}
            className="font-bold text-white hover:underline ml-1"
          >
            Add clothes
          </button>
        </div>,
        { duration: 4000 }
      );
      return;
    }
    setOutfit([...wardrobe].sort(() => 0.5 - Math.random()).slice(0, 3));
  }, [wardrobe, navigate]);

  // ── VTO ────────────────────────────────────────────────────────────────────

  const getBase64FromUrl = async (url) => {
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to fetch image as base64:", error);
      throw new Error("فشل في تحميل صورة الملابس، قد يكون بسبب صلاحيات الرابط (CORS).");
    }
  };

  // Fetch forecast for the chosen date/time using Open-Meteo hourly forecast
  const fetchForecastForSelected = async () => {
    setForecastError(null);
    setForecastWeather(null);
    if (!((cityValid || mapSelected) && chosenDate && chosenTime)) {
      setForecastError("Please select a city or pick a map location, plus date and time.");
      return;
    }

    const coords = selectedCoords;
    if (!coords || !coords.lat) {
      setForecastError("Location coordinates are not available.");
      return;
    }

    setForecastLoading(true);
    try {
      const date = chosenDate; // YYYY-MM-DD
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Forecast fetch failed");
      const data = await res.json();
      const times = data.hourly?.time || [];
      const temps = data.hourly?.temperature_2m || [];
      const codes = data.hourly?.weathercode || [];
      if (!times.length) throw new Error("No forecast data available for that date");

      // Build target ISO string matching the API timezone format: date + 'T' + time
      const target = `${chosenDate}T${chosenTime}`;
      // Find nearest index
      let bestIdx = 0;
      let bestDiff = Infinity;
      for (let i = 0; i < times.length; i++) {
        const diff = Math.abs(new Date(times[i]).getTime() - new Date(target).getTime());
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = i;
        }
      }

      const temp = Math.round(temps[bestIdx]);
      const code = codes[bestIdx];
      const desc = getWeatherDesc(code);
      setForecastWeather({ city: location || "Selected location", temp, desc, date: chosenDate, time: chosenTime });
    } catch (e) {
      console.error(e);
      setForecastError(e.message || "Failed to fetch forecast");
    } finally {
      setForecastLoading(false);
    }
  };

  const runVTO = async () => {
    if (!userPhoto || !outfit.length) return;

    // Filter supported items (ignore shoes and accessories if any)
    const supportedGarments = outfit.filter(i => {
      const t = (getItemType(i) + " " + getItemName(i)).toLowerCase();
      return t.includes("top") || t.includes("outerwear") || t.includes("bottom") || t.includes("upper") || t.includes("lower") || t.includes("dress") || t.includes("coat") || t.includes("jacket") || t.includes("shirt") || t.includes("pant") || t.includes("shorts") || t.includes("jeans") || t.includes("skirt");
    });

    if (!supportedGarments.length) {
      alert("القطع المحددة غير مدعومة للتبديل (فقط الملابس العلوية والسفلية).");
      return;
    }

    setVtoLoading(true);
    setVtoResult(null);

    let currentPersonBase64 = userPhoto.b64;

    try {
      let API_URL = import.meta.env.VITE_VTON_API_URL;
      API_URL = API_URL.replace(/\/+$/, "");
      if (API_URL.endsWith("/api/tryon")) {
        API_URL = API_URL.replace("/api/tryon", "");
      }

      setVtoLoadingText("Preparing your outfit...");
      let upperCloth = null;
      let lowerCloth = null;
      let overallCloth = null;
      let outerCloth = null;

      for (const garment of supportedGarments) {
        const itemType = getItemType(garment).toLowerCase();
        const itemName = getItemName(garment).toLowerCase();
        const typeStr = itemType + " " + itemName;
        const b64 = await getBase64FromUrl(getItemImage(garment));

        if (typeStr.includes("dress") || typeStr.includes("overall") || typeStr.includes("full") || typeStr.includes("gown")) {
          overallCloth = b64;
        } else if (typeStr.includes("jacket") || typeStr.includes("coat") || typeStr.includes("outerwear") || typeStr.includes("cardigan") || typeStr.includes("blazer") || typeStr.includes("hoodie")) {
          outerCloth = b64;
        } else if (itemType.includes("bottom") || itemType.includes("lower") || typeStr.includes("pant") || typeStr.includes("jeans") || typeStr.includes("skirt") || typeStr.includes("shorts")) {
          lowerCloth = b64;
        } else {
          upperCloth = b64;
        }
      }

      setVtoLoadingText("Applying outfit with AI magic...");


      ////////////////////////////////////////{APIS}//////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////
      const rawEndpoints = import.meta.env.VITE_VTON_ENDPOINTS || "";
      const API_ENDPOINTS = rawEndpoints.split(",").map(url => url.trim()).filter(Boolean);

      let data = null;
      let lastError = null;

      for (const endpoint of API_ENDPOINTS) {
        try {
          const vtonRes = await fetch(`${endpoint}/api/tryon`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              "Bypass-Tunnel-Reminder": "true",
            },
            body: JSON.stringify({
              person_image_b64: currentPersonBase64,
              upper_cloth_b64: upperCloth,
              lower_cloth_b64: lowerCloth,
              overall_cloth_b64: overallCloth,
              outer_cloth_b64: outerCloth,
            }),
          });

          if (!vtonRes.ok) {
            const errText = await vtonRes.text();
            throw new Error(`${vtonRes.status} ${errText}`);
          }

          data = await vtonRes.json();
          lastError = null;
          break; // Success! Exit the fallback loop
        } catch (err) {
          console.warn(`فشل الاتصال بـ ${endpoint}:`, err.message);
          lastError = err;
        }
      }

      if (lastError) {
        throw new Error(`السيرفرات متوقفة حالياً.: ${lastError.message}`);
      }

      // Support both the new schema and old schema formats
      if (data.success && data.result_b64) {
        setVtoResult(data.result_b64);
        try {
          await trackModelUsage("virtualTryOn");
        } catch (trackingError) {
          console.warn("Virtual try-on usage tracking failed:", trackingError);
        }
      } else if (data.result_image_b64) {
        setVtoResult(`data:image/jpeg;base64,${data.result_image_b64}`);
        try {
          await trackModelUsage("virtualTryOn");
        } catch (trackingError) {
          console.warn("Virtual try-on usage tracking failed:", trackingError);
        }
      } else {
        throw new Error(data.error || "Invalid response from VTON API");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الاتصال بالسيرفر: " + e.message);
      setVtoResult(userPhoto.preview);
    } finally {
      setVtoLoading(false);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////

  const quickPrompts = [
    "More casual",
    "Formal version",
    "Evening look",
    "Weather-appropriate",
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // SUB-PANELS (shared between mobile tabs & desktop grid)
  // ─────────────────────────────────────────────────────────────────────────

  const ChatPanel = ({ compact = false }) => {
    const { navbarVisible, toggleNavbar } = useNavbar();

    return (
      <div
        className={`flex flex-col glass rounded-3xl overflow-hidden shadow-2xl ${compact ? "h-[calc(100dvh-180px)]" : "h-[620px]"
          }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-2 md:p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 bg-white/5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-md flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] md:text-[12px] font-black text-white uppercase italic tracking-wider leading-tight">
                AI Stylist
              </p>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1">
                <div className="flex items-center gap-2 text-[11px] text-white/70 min-w-0">
                  <MapPin size={12} className="text-white/60 flex-shrink-0" />
                  <span className="truncate">{location || "No location selected"}</span>
                </div>
              </div>
              <p className="text-[9px] text-[#7c3aed] font-bold mt-1 truncate">Items Analysed: {wardrobe.length}</p>
              {aiLoading && (
                <div className="text-[10px] text-white/50 mt-1">Generating outfit suggestions...</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <div className="min-w-0 flex-shrink-0">
              <WeatherBadge weather={forecastWeather || weather} size="sm" showNoLocation={!(forecastWeather || weather)} loading={weatherLoading} />
            </div>
            {isMobile && (
              <button
                onClick={toggleNavbar}
                className={`lg:hidden p-2 rounded-xl transition-colors flex items-center gap-1 ${navbarVisible
                  ? "bg-[#7c3aed]/20 text-[#7c3aed]"
                  : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                title={navbarVisible ? "Hide menu" : "Show menu"}
                aria-label={navbarVisible ? "Hide menu" : "Show menu"}
              >
                {navbarVisible ? <X size={14} /> : <Menu size={14} />}
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] hidden sm:inline">
                  {navbarVisible ? "Close" : "Menu"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 space-y-3 custom-scroll bg-black/10 flex flex-col">
          {messages.length === 0 && !aiLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-60 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-center justify-center">
                <Bot size={28} className="text-[#7c3aed]" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-black text-white/80 uppercase tracking-wide">
                  Welcome to Itlala AI
                </p>
                <p className="text-[11px] text-white/50 font-medium mt-2 leading-relaxed">
                  Upload your photo or ask for outfit suggestions
                </p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`p-3 text-[12px] md:text-[13px] leading-relaxed max-w-[85%] font-medium ${m.role === "user" ? "bubble-user" : "bubble-ai"
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bubble-ai px-4 py-3 flex gap-1.5 items-center rounded-2xl">
                {[0, 150, 300].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length > 0 && !aiLoading && (
          <div className="flex-shrink-0 px-3 md:px-4 pt-2 flex flex-wrap gap-1.5">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-[8px] md:text-[9px] px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 hover:border-[#7c3aed]/40 hover:text-white/80 transition-all font-bold uppercase tracking-wider"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 p-2 md:p-3 border-t border-white/5 bg-black/20">
          <ChatInput onSend={sendMessage} inputRef={inputRef} />
        </div>
      </div>
    );
  };

  const WardrobePanel = ({ compact = false }) => (
    <div
      className={`flex flex-col glass rounded-3xl overflow-hidden shadow-2xl ${compact ? "h-[calc(100dvh-180px)]" : "h-[620px]"
        }`}
    >
      <div className="flex-shrink-0 p-3 md:p-4 bg-white/5 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Wardrobe
          </p>
          {!wardrobeLoading && wardrobe.length > 0 && (
            <p className="text-[8px] md:text-[9px] text-[#7c3aed] font-bold mt-0.5">
              {outfit.length} / {wardrobe.length} selected
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {wardrobeLoading && (
            <Loader2 size={14} className="text-[#7c3aed] animate-spin" />
          )}
          {!wardrobeLoading && (
            <button
              onClick={randomOutfit}
              className={`text-[8px] md:text-[9px] uppercase tracking-widest font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full border transition-colors flex items-center gap-1 flex-shrink-0 ${wardrobe.length > 0
                ? "border-white/10 bg-white/5 hover:bg-[#7c3aed]/15"
                : "border-white/20 bg-white/5 hover:bg-white/10 opacity-60"
                }`}
            >
              <Sparkles size={10} /> <span className="hidden sm:inline">Random</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 space-y-2.5 custom-scroll">
        {wardrobeLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
            <Loader2 size={28} className="animate-spin text-[#7c3aed]" />
            <span className="text-[10px] uppercase tracking-widest font-bold">
              Loading wardrobe...
            </span>
          </div>
        )}
        {!wardrobeLoading && wardrobeError && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <AlertCircle size={24} className="text-red-400 opacity-60" />
            <span className="text-[10px] md:text-[11px] text-red-400 font-medium">
              {wardrobeError}
            </span>
            <button
              onClick={() => {
                setWardrobeError(null);
                setWardrobeLoading(true);
                getWardrobe()
                  .then(setWardrobe)
                  .catch((e) => setWardrobeError(e.message))
                  .finally(() => setWardrobeLoading(false));
              }}
              className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!wardrobeLoading && !wardrobeError && wardrobe.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Shirt size={28} className="text-white/40" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm md:text-base font-bold text-white">No clothes Found .</p>
              <p className="text-xs md:text-sm text-white/60">
                Go to {"  "}
                <button
                  onClick={() => navigate("/features/wardrobe")}
                  className="text-white font-semibold hover:text-white/80 transition-colors underline underline-offset-2"
                >
                  add Your items
                </button>
              </p>
            </div>
          </div>
        )}
        {!wardrobeLoading &&
          wardrobe.map((item, i) => (
            <WardrobeItemCard
              key={item.id ?? item._id ?? i}
              item={item}
              selected={outfit.some(
                (o) => (o.id ?? o._id) === (item.id ?? item._id),
              )}
              onToggle={toggleItem}
            />
          ))}
      </div>
    </div>
  );

  // Portrait panel — shows full image (no crop)
  const PortraitUpload = ({ inputId = "photo-up" }) => (
    <div className="glass rounded-3xl overflow-hidden shadow-xl">
      <div className="p-3 md:p-4 border-b border-white/5 bg-white/5 flex items-center justify-between gap-2">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 truncate">
          Your Portrait
        </span>
        {userPhoto && (
          <button
            onClick={() => document.getElementById(inputId).click()}
            className="text-[8px] md:text-[9px] text-[#7c3aed] font-bold uppercase tracking-widest hover:text-[#a78bfa] transition-colors flex-shrink-0"
          >
            Change
          </button>
        )}
      </div>
      <div
        onClick={() => !userPhoto && document.getElementById(inputId).click()}
        className={`relative w-full ${!userPhoto ? "cursor-pointer" : ""}`}
      >

        {userPhoto ? (
          /* Full image — object-contain so nothing gets cut */

          <div className="relative w-full bg-transparent overflow-hidden">
            <img
              src={userPhoto.preview}
              alt="Portrait"
              className={`w-full h-auto object-contain block transition-all duration-500 ${vtoLoading ? 'brightness-75' : ''}`}
              style={{ maxHeight: 380 }}
            />
            {vtoLoading && (
              <>
                <div className="scanner-overlay" />
                <div className="scanner-line" />
              </>
            )}
            <button
              onClick={() => document.getElementById(inputId).click()}
              disabled={vtoLoading}
              className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-black/70 border border-white/20 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm hover:bg-[#7c3aed]/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Camera size={10} className="inline mr-1" />
              Change
            </button>
          </div>
        ) : (
          <div className="w-full h-40 md:h-48 flex flex-col items-center justify-center gap-2 md:gap-3 bg-white/[0.02] hover:bg-white/5 transition-all p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#7c3aed]/40 box-border">
            <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Camera size={20} className="text-white/40" />
            </div>
            <div className="text-center px-2">
              <p className="text-[10px] md:text-[11px] font-bold text-white/60 uppercase tracking-widest">
                Upload Portrait
              </p>
              <p className="text-[8px] md:text-[9px] text-white/35 mt-0.5">
                Full or upper body works best
              </p>

            </div>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          hidden
          accept="image/*"
          onChange={handlePhotoUpload}
        />
      </div>
    </div>
  );

  async function selectSampleImage(url) {
    try {
      const b64 = await getBase64FromUrl(url);
      setUserPhoto({ preview: url, b64 });
      setSampleModalOpen(false);
    } catch (e) {
      console.error("Failed to load sample image:", e);
    }
  }


  const OutfitGrid = () => {
    // Hide if no outfit selected
    if (outfit.length === 0) return null;

    return (
      <div className="glass rounded-3xl overflow-hidden shadow-xl">
        <div className="p-3 md:p-4 border-b border-white/5 bg-white/5 flex items-center justify-between gap-2">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 truncate">
            Selected Outfit
          </span>
          <span className="text-[8px] md:text-[9px] text-[#7c3aed] font-bold flex-shrink-0">
            {outfit.length} items
          </span>
        </div>
        <div className="p-3 md:p-4 grid grid-cols-3 gap-2">
          {outfit.map((item, i) => {
            const name = getItemName(item, `Item ${i + 1}`);
            const image = getItemImage(item);
            const type = getItemType(item);
            return (
              <div
                key={item.id ?? item._id ?? i}
                onClick={() => toggleItem(item)}
                className="relative bg-white/5 rounded-xl overflow-hidden border border-white/8 cursor-pointer group hover:border-red-400/40 transition-all"
              >
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center bg-white/5">
                    <Shirt size={16} className="text-white/20" />
                  </div>
                )}
                <div className="p-1">
                  {type && (
                    <p className="text-[7px] text-[#7c3aed] font-black uppercase truncate leading-tight">
                      {type}
                    </p>
                  )}
                  <p className="text-[8px] font-bold text-white/70 truncate leading-tight">
                    {name}
                  </p>
                </div>
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500/80 items-center justify-center hidden group-hover:flex">
                  <X size={8} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TryOnButton = () => (
    <button
      onClick={runVTO}
      disabled={vtoLoading || !userPhoto || outfit.length === 0}
      className="w-full bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#4f46e5] py-4 px-6 rounded-2xl font-black uppercase tracking-[0.12em] shadow-[0_10px_30px_rgba(124,58,237,0.4)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.5)] active:scale-95 transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm md:text-base"
    >
      {vtoLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {vtoLoadingText}
        </span>
      ) : !userPhoto ? (
        " Upload Portrait First"
      ) : outfit.length === 0 ? (
        " Select Items from Wardrobe"
      ) : (
        ` Try On ${outfit.length} Item${outfit.length !== 1 ? "s" : ""}`
      )}
    </button>
  );

  const NeuralMirror = () => (
    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-3 md:p-4 border-b border-white/5 bg-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ScanLine size={14} className="text-[#7c3aed] flex-shrink-0" />
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white truncate">
            Neural Mirror
          </span>
        </div>
        {vtoLoading && (
          <span className="text-[7px] md:text-[9px] text-[#7c3aed] font-bold uppercase tracking-widest shimmer flex-shrink-0">
            <span className="hidden sm:inline">{vtoLoadingText}</span>
            <span className="sm:hidden">Processing...</span>
          </span>
        )}
      </div>
      <div className="p-5 bg-transparent relative">
        {vtoLoading ? (
          /* Loading mirror - only displays the spinning loading chip and loading text */
          <div className="w-full aspect-[3/4] max-w-xs mx-auto flex flex-col items-center justify-center bg-white/[0.01] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-2 border-white/5 rounded-full" />
              <div className="w-20 h-20 border-t-4 border-[#7c3aed] rounded-full animate-spin absolute inset-0 shadow-[0_0_30px_rgba(124,58,237,0.5)]" />
              <Cpu
                size={22}
                className="absolute inset-0 m-auto text-white animate-pulse"
              />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white shimmer text-center px-6 leading-relaxed">
              {vtoLoadingText}
            </p>
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30">
              <ShieldCheck size={13} className="text-[#7c3aed]" />
              <span className="text-[9px] text-white font-bold uppercase tracking-widest">
                Identity Preserved
              </span>
            </div>
          </div>
        ) : vtoResult ? (
          /* Result is ready - show the before/after slider and download button */
          <>
            <BeforeAfterSlider
              before={userPhoto?.preview}
              after={vtoResult}
              loading={vtoLoading}
              flipAfter={false}
            />
            <a
              href={vtoResult}
              download="itlala-vto.jpg"
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.12em] hover:bg-white/15 transition-all active:scale-95"
            >
              <Download size={15} /> Save Portrait
            </a>
          </>
        ) : (
          /* Placeholder state - before try-on has run */
          <div className="w-full aspect-[3/4] max-w-xs mx-auto flex flex-col items-center justify-center opacity-40 gap-4 rounded-3xl border border-dashed border-white/10 p-6 bg-white/[0.02]">
            <ScanLine size={32} className="text-[#7c3aed] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white text-center">
              Mirror Standby
            </span>
            <span className="text-[9px] text-white/50 text-center leading-relaxed max-w-[200px]">
              Select items from your wardrobe and click Try On to reflect your new look in the mirror.
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile try-on tab content
  const TryOnTab = () => (
    <div className="space-y-3 md:space-y-4 pb-4">
      <div>
        <button
          type="button"
          onClick={() => setAvatarModalOpen(true)}
          className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#4f46e5]/20 hover:from-[#7c3aed]/30 hover:to-[#4f46e5]/30 text-white font-semibold border border-[#7c3aed]/30 transition-all flex items-center gap-2"
        >
          <Sparkles size={14} /> Create your Avatar
        </button>
        <p className="text-[10px] text-white/50 mt-2">Use our AI generator to build your perfect digital twin!</p>
      </div>
      <PortraitUpload inputId="photo-mob" />
      <OutfitGrid />
      <TryOnButton />
      {userPhoto && <NeuralMirror />}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-[#f8f8ff] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        *, *::before, *::after { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .glass { background: rgba(16,10,32,0.55); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.07); }
        .bubble-user { border-radius: 18px 18px 4px 18px; background: linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; }
        .bubble-ai   { border-radius: 18px 18px 18px 4px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color:#f8f8ff; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 9px; }

        /* Site-wide polished scrollbar */
        ::-webkit-scrollbar { width: 12px; height: 12px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 12px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#7c3aedcc,#4f46e5cc); border-radius: 12px; box-shadow: inset 0 0 0 3px rgba(0,0,0,0.25); }
        ::-webkit-scrollbar-thumb:hover { transform: scale(1.02); }
        ::-webkit-scrollbar-corner { background: transparent; }

        /* Firefox */
        * { scrollbar-width: thin; scrollbar-color: #7c3aedcc rgba(255,255,255,0.03); }

        /* Small refinements */
        .time-scroll::-webkit-scrollbar{width:8px;height:8px}
        .time-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#7c3aed66,#4f46e566);border-radius:8px}
        .time-scroll{scrollbar-width:thin;scrollbar-color:#7c3aed66 transparent}

        @keyframes fade-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        .shimmer { animation: shimmer 2s ease-in-out infinite; }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #7c3aed, #c084fc, #7c3aed, transparent);
          box-shadow: 0 0 15px 4px rgba(124, 58, 237, 0.6);
          animation: scan 2.5s linear infinite;
          z-index: 20;
        }
        .scanner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0.15) 100%);
          pointer-events: none;
          z-index: 10;
        }
      `}</style>

      {/* ─── SETUP ─── */}
      {step === "setup" && (

        <div className="max-w-7xl mx-auto mt-16 md:mt-12 lg:mt-20 flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center justify-between px-3 md:px-4 animate-fade-in">

          {/* Mobile hero strip */}
          <div className="md:hidden h-auto relative overflow-hidden">
            <img
              src="https://miro.medium.com/v2/resize:fit:1400/0*o4C2rpQswzUcimwG"
              className="w-full h-full object-cover object-top"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-base font-black tracking-tight">
                ITLALA <span className="text-[#7c3aed]">AI</span>
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 flex items-center p-3 md:p-6 lg:p-16 w-full">
            <div className="w-full max-w-md space-y-5 md:space-y-7 animate-fade-in">
              {/* Logo desktop */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)]">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-base md:text-lg font-black tracking-tight">
                  ITLALA <span className="text-[#7c3aed]">AI</span>
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.88] tracking-tight uppercase italic">
                  Virtual
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#818cf8]">
                    Try‑On.
                  </span>
                </h1>
                <p className="text-white mt-2 md:mt-3 text-xs md:text-sm font-medium leading-relaxed">
                  AI picks the perfect outfit from your wardrobe — then dresses
                  you in it.
                </p>
              </div>

              <div className="space-y-3">
                {/* Occasion input */}
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    placeholder="What's the occasion?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-5 focus:border-[#7c3aed]/60 outline-none text-white transition-all text-sm placeholder:text-white/35 font-medium"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                  />
                </div>

                {/* Occasion chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Work",
                    "Casual",
                    "Wedding",
                    "Beach",
                    "Gym",
                    "Date Night",
                  ].map((o) => (
                    <button
                      key={o}
                      onClick={() => setEvent(o)}
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border transition-all ${event === o
                        ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-[#7c3aed]/40 hover:text-white/80 hover:bg-white/8"
                        }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>

                {/* City */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Thermometer
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        type="text"
                        placeholder="Your city for live weather"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-12 focus:border-[#7c3aed]/60 outline-none text-white placeholder:text-white/50 transition-all text-sm font-medium"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setMapSelected(false);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
                      />
                      <button
                        type="button"
                        onClick={() => setIsMapOpen(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-3xl text-white/40 hover:text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-all flex items-center justify-center"
                        aria-label="Open map picker"
                      >
                        <MapPin size={18} />
                      </button>
                    </div>
                    <button
                      onClick={fetchWeather}
                      disabled={(!cityValid && !mapSelected) || weatherLoading}
                      className={`flex-shrink-0 px-4 md:px-5 rounded-2xl border font-bold transition-all flex items-center justify-center ${(!cityValid && !mapSelected) || weatherLoading
                        ? "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                        : "bg-[#7c3aed]/15 border-[#7c3aed]/30 hover:bg-[#7c3aed]/25 text-[#7c3aed] shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
                        }`}
                      title={(!cityValid && !mapSelected) ? "Enter a city or pick a location" : "Search city or confirm location"}
                      aria-disabled={((!cityValid && !mapSelected) || weatherLoading) ? "true" : "false"}
                    >
                      {weatherLoading ? (
                        <Loader2 className="animate-spin" size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </button>
                  </div>

                  {/* Weather badge */}
                  {/* Forecast chooser (optional) */}
                  <div className="animate-fade-in">
                    <div className="rounded-2xl p-3 md:p-4 bg-white/10 backdrop-blur-lg border border-white/10">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white capitalize">Select The Date</h3>
                          </div>
                          <p className="text-[11px] text-white/60 mt-1">Planning for a future event? Select a date and time and we'll use the expected weather conditions.</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <DateTimePicker
                          chosenDate={chosenDate}
                          setChosenDate={setChosenDate}
                          chosenTime={chosenTime}
                          setChosenTime={setChosenTime}
                          disabled={!cityValid && !mapSelected}
                        />
                      </div>

                      {forecastError && <div className="text-[12px] text-red-400 mt-2">{forecastError}</div>}

                      {forecastWeather && (
                        <div className="mt-3 p-3 rounded-xl border border-white/6 bg-black/10">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-[13px] font-bold text-white truncate">{forecastWeather.city}</div>
                              <div className="text-[11px] text-white/60">{new Date(forecastWeather.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                              <div className="text-[11px] text-white/60">{forecastWeather.time}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[18px] font-black text-white">{forecastWeather.temp}°C</div>
                              <div className="text-[12px] text-white/60">{forecastWeather.desc}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {isMapOpen && mapPortalEl && createPortal(
                  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md">
                    {/* MAP MODAL CONTAINER (78vw & 80vh) */}
                    <div className="relative w-[78vw] h-[80vh] overflow-hidden rounded-[2rem] border border-white/10 bg-transparent shadow-[0_45px_140px_rgba(0,0,0,0.75)]">


                      <button
                        type="button"
                        onClick={() => setIsMapOpen(false)}
                        className="absolute top-4 right-4 z-[10000] h-8 w-8 rounded-xl bg-black backdrop-blur-md border border-white/10 text-white transition-all hover:scale-105 flex items-center justify-center shadow-lg"
                        aria-label="Close map"
                      >
                        <X size={12} />
                      </button>


                      <div className="absolute inset-0">
                        <MapContainer
                          center={
                            selectedCoords
                              ? [selectedCoords.lat, selectedCoords.lng]
                              : [26.8206, 30.8025]
                          }
                          zoom={selectedCoords ? 9 : 6}
                          minZoom={5}
                          maxZoom={12}
                          scrollWheelZoom={true}
                          className="h-full w-full z-0"
                          maxBounds={[
                            [21.5, 24.5],
                            [32.5, 37.5],
                          ]}
                          maxBoundsViscosity={1.0}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <MapClickHandler
                            onMapClick={async (latlng) => {
                              await handleMapClick(latlng);
                              window.setTimeout(() => setIsMapOpen(false), 0);
                            }}
                          />

                          {selectedCoords && (
                            <Marker
                              position={[
                                selectedCoords.lat,
                                selectedCoords.lng,
                              ]}
                            />
                          )}
                        </MapContainer>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}

                <p className="mt-2 md:mt-3 text-[10px] md:text-[11px] text-white/60">
                  Tap the pin icon to open the floating map picker. Choose a location and it will auto-fill the city field.
                </p>

                <button
                  onClick={() => {
                    setStep("chat");
                    setMessages([]);
                    setOutfit([]);
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!weather || !event || !chosenDate || !chosenTime}
                  className="w-full bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#4f46e5] py-4 px-6 rounded-2xl font-black uppercase tracking-[0.13em] shadow-[0_10px_30px_rgba(124,58,237,0.4)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.5)] active:scale-95 transition-all text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none text-sm md:text-base"
                >
                  {!weather
                    ? " Add city first"
                    : !event
                      ? " Choose occasion"
                      : !chosenDate || !chosenTime
                        ? " Select date & time"
                        : " START STYLING →"}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop hero */}
          <div className="hidden md:block flex-1 glass rounded-[4rem] overflow-hidden p-4 relative group shadow-2xl">
            <img
              src="https://miro.medium.com/v2/resize:fit:1400/0*o4C2rpQswzUcimwG"
              className="w-full h-[550px] object-cover rounded-[3.5rem]"
              alt="Style"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-80" />
          </div>
        </div>
      )}

      {/* ─── CHAT STEP ─── */}
      {step === "chat" && (
        <>
          {/* Top bar */}
          <div className="md:sticky md:top-0 static z-40 bg-transparent backdrop-blur-xl border-b border-white/5 px-3 md:px-8 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 flex-wrap mt-10">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 md:w-7 h-6 md:h-7 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-xs md:text-sm font-black tracking-tight hidden sm:inline">
                ITLALA <span className="text-[#7c3aed]">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap flex-1 min-w-0">
              <div className="hidden md:block min-w-0 flex-shrink">
                <WeatherBadge weather={forecastWeather || weather} size="sm" showNoLocation={!(forecastWeather || weather)} loading={weatherLoading} />
              </div>
              {event && (
                <div className="flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/8 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#7c3aed] flex-shrink-0">
                  <Calendar size={8} />
                  <span className="hidden sm:inline">{event}</span>
                  <span className="sm:hidden">{event.split(" ")[0]}</span>
                </div>
              )}
            </div>
            {/* Create Avatar Button on Mobile */}
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="lg:hidden text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#4f46e5]/20 hover:from-[#7c3aed]/30 hover:to-[#4f46e5]/30 text-white border border-[#7c3aed]/30 transition-all flex items-center gap-1 ml-auto flex-shrink-0"
            >
              <Sparkles size={10} /> Create Avatar
            </button>
            <button
              onClick={() => {
                setStep("setup");
                setMessages([]);
                setOutfit([]);
              }}
              className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10 ml-2 flex-shrink-0"
            >
              ← Back
            </button>
          </div>

          {/* Error banner */}
          {wardrobeError && (
            <div className="mx-4 lg:mx-8 mt-4 flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span className="font-medium flex-1">{wardrobeError}</span>
              <button
                onClick={() => {
                  setWardrobeError(null);
                  setWardrobeLoading(true);
                  getWardrobe()
                    .then(setWardrobe)
                    .catch((e) => setWardrobeError(e.message))
                    .finally(() => setWardrobeLoading(false));
                }}
                className="font-black uppercase tracking-widest hover:text-red-300 transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── DESKTOP 3-column layout ── */}
          <div className="hidden lg:grid grid-cols-12 gap-5 p-6 xl:p-8">
            {/* Col 1 – Chat */}
            <div className="col-span-5">
              <ChatPanel />
            </div>

            {/* Col 2 – Wardrobe */}
            <div className="col-span-3">
              <WardrobePanel />
            </div>

            {/* Col 3 – Portrait + Outfit + Button */}
            <div className="col-span-4 flex flex-col gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#4f46e5]/20 hover:from-[#7c3aed]/30 hover:to-[#4f46e5]/30 text-white font-semibold border border-[#7c3aed]/30 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} /> Create your Avatar
                </button>
                <p className="text-[10px] text-white/50 mt-2">Use our AI generator to build your perfect digital twin!</p>
              </div>
              <PortraitUpload inputId="photo-desk" />
              <OutfitGrid />
              <TryOnButton />
            </div>
          </div>

          {/* Neural Mirror — desktop (below grid) */}
          <div className="hidden lg:block mx-6 xl:mx-8 mb-10">
            <NeuralMirror />
          </div>

          {/* ── MOBILE: tab content ── */}
          <div className="lg:hidden px-2 md:px-3 pt-3 md:pt-4 pb-24 space-y-4">
            {activeTab === "chat" && <ChatPanel compact />}
            {activeTab === "wardrobe" && <WardrobePanel compact />}
            {activeTab === "tryon" && <TryOnTab />}
          </div>

          {/* Mobile tab bar */}
          <MobileTabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            outfitCount={outfit.length}
          />
        </>
      )}
      <AvatarGeneratorModal 
        isOpen={avatarModalOpen} 
        onClose={() => setAvatarModalOpen(false)} 
        onUseAvatar={(photoData) => setUserPhoto(photoData)}
        defaultGender={user?.gender} 
      />
    </div>
  );
}

export default TryOn;