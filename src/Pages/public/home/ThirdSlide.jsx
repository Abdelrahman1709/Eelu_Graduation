import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Title from "../../../ui/Title";
import promoVideo from "../../../assets/video/202606170356.mp4";

const steps = [
  {
    title: "Login & Profile",
    description: "Sign in to your personal profile so your wardrobe and styling history are saved automatically.",
  },
  {
    title: "Upload Your Wardrobe",
    description: "Add your clothing items to build your closet; every piece is catalogued and ready for styling.",
  },
  {
    title: "Ready Outfit Dataset",
    description: "Use a pre-built dataset of curated looks if you prefer not to upload every item yourself.",
  },
  {
    title: "Event Styling",
    description: "Choose your occasion, time and date, then start styling with the system tuned for that event.",
  },
  {
    title: "Chatbot Recommendations",
    description: "Talk to the style bot with the perfect prompt and get recommended looks for your trip.",
  },
  {
    title: "Virtual Try-On",
    description: "Preview the selected outfits on your image in real time to see the fit and mood.",
  },
  {
    title: "Compare & Save",
    description: "Compare your top looks, save them to your wardrobe, and finalize the best outfit.",
  },
];

export default function HowItWorks() {
  const timelineRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  const [lineFill, setLineFill] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.min(
        Math.max((viewportHeight - rect.top) / (rect.height + viewportHeight), 0),
        1,
      );

      setLineFill(progress);

      let closestIndex = 0;
      let closestDistance = Infinity;

      itemRefs.current.forEach((element, index) => {
        if (!element) return;
        const itemRect = element.getBoundingClientRect();
        const center = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(center - viewportHeight * 0.45);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStep(closestIndex);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStepClick = (index) => {
    const element = itemRefs.current[index];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setActiveStep(index);
  };

  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 2xl:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]  blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <Title
          title="How Itlala Works"
          heading="ETLALA’s premium fashion workflow"
          description="Log in to your profile, upload your wardrobe, access a ready outfit dataset, pick your event, and let the chatbot recommend looks for virtual try-on." 
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[280px] lg:max-w-[320px]"
          >
            {/* Glow background */}
            <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 rounded-[4rem] blur-3xl opacity-40 -z-10" />
            
            <div className="relative">
              <div className="relative mx-auto w-full max-w-[320px] rounded-[3rem]">
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-cyan-400/35 via-violet-500/25 to-cyan-400/35 blur-xl" />
                <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/95 shadow-[0_40px_90px_rgba(15,23,42,0.25)]">
                  <div className="relative aspect-[9/16] overflow-hidden">
                    <video
                      src={promoVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-7 w-3/4 rounded-full bg-slate-900/50 blur-3xl opacity-40" />
            </div>
          </motion.div>

          <motion.div
            ref={timelineRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10  p-5 lg:p-6 shadow-2xl backdrop-blur-xl h-fit"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.06),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.06),_transparent_60%)]" />
            <div className="absolute left-7 top-8 h-[calc(100%-64px)] w-0.5 rounded-full" />
            <div
              className="absolute left-7 top-8 w-0.5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500"
              style={{ height: `${Math.min(100, Math.max(10, lineFill * 100))}%` }}
            />

            <div className="relative space-y-2 ml-6">
              <div className="space-y-2 mb-5 relative z-10 -ml-1">
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80 font-bold">
                  ETLALA onboarding
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  AI fashion made effortless.
                </h2>
                <p className="text-xs text-slate-300 leading-6">
                  Follow the seven-step ETLALA journey and transform your styling workflow.
                </p>
              </div>

              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <motion.button
                    type="button"
                    key={step.title}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => handleStepClick(index)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
                    whileHover={{ y: -2 }}
                    className={`group w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400/30 bg-cyan-400/8 shadow-[0_4px_12px_rgba(56,189,248,0.06)]"
                        : "border-white/5 bg-transparent hover:border-cyan-400/20 hover:bg-white/3"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs ${
                            isActive
                              ? "border-transparent bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_0_10px_rgba(99,102,241,0.12)]"
                              : "border-white/10 bg-slate-900/80"
                          } font-semibold text-white transition-all duration-300`}
                        >
                          {index + 1}
                        </div>
                        <div className={`mt-1 h-8 w-[2px] rounded-full ${isActive ? "bg-gradient-to-b from-cyan-400 to-violet-500" : "bg-white/10"}`} />
                      </div>

                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold tracking-tight ${isActive ? "text-white" : "text-slate-100"}`}>
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
