import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { X as XIcon, Sparkles } from "lucide-react";
import Logo from "../assets/Logo/Logo.avif";

const OutfitSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  const handleAction = () => {
    setIsOpen(false);
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/features/tryOn");
  };

  // إغلاق الكارد عند الضغط على زر Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. THE FLOATING ORB (الزر الثابت عند السكرول) */}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed left-5 bottom-5 z-[9999] flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/90 border border-white/10 shadow-[0_0_22px_rgba(139,92,246,0.28)] group cursor-pointer transition-transform hover:scale-110"
        aria-label="Open style assistant"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ec4899] via-[#8b5cf6] to-[#3b82f6] opacity-40 blur-[5px]" />
        <img
          src={Logo}
          alt="ITLALA logo"
          className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover z-10 border border-white/10"
        />
        <div className="absolute -top-1 -right-1 bg-[#ec4899] text-white p-0.5 rounded-full z-20 shadow-md transition-transform duration-200 group-hover:animate-spin">
          <Sparkles size={10} />
        </div>
      </button>

      {/* 2. THE OVERLAY AND SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9997] bg-black/20 backdrop-blur-[2px]" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -20 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed left-3 bottom-20 z-[9998] w-[300px] sm:w-[320px] max-h-[70vh] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
              <div className="relative flex h-full flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={Logo} alt="ITLALA" className="h-8 w-8 rounded-xl object-cover" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">ITLALA AI</p>
                      <h2 className="text-lg font-semibold text-white">Style Assistant</h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-xs text-slate-300 leading-6">
                    Let's find your signature look for today. Our digital wardrobe assistant is ready to curate the perfect fit.
                  </div>
                  
                  <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-300 mb-3">Key Features</p>
                    <ul className="space-y-3 text-xs text-slate-300">
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Instant recommendations</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Virtual Try-On integration</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Personalized styling</li>
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-white/5 p-6 bg-slate-950/40">
                  <button
                    type="button"
                    onClick={handleAction}
                    className="w-full rounded-2xl bg-white text-black py-3.5 text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {user ? "Discover Today's Fit" : "Sign In to Access"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default OutfitSidebar;