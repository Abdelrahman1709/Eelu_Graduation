import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Title from "../../../ui/Title";
import { Plus } from "lucide-react";
import { featuresData } from "../../../Data/DataOfCard";

export default function Features() {
  const refs = useRef([]);
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visibleFeatures = featuresData;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <div id="services" className="pt-24 -mt-24" />
      <section id="features" className="py-20 2xl:py-32">
        <div className="max-w-7xl mx-auto px-4 relative">
          <Title
            title="Services"
            heading="Why ITLALA?"
            description="A comprehensive platform to organize your wardrobe and discover new looks using artificial intelligence."
          />

          <div className="mt-10 relative">
            <div className="relative">
              <div
                ref={containerRef}
                onScroll={() => {
                  const el = containerRef.current;
                  if (!el) return;
                  setCanScrollLeft(el.scrollLeft > 10);
                  setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
                }}
                className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth pb-3"
              >
                {visibleFeatures.map((feature, i) => {
                  const isChat = feature.title.toLowerCase().includes("chat");
                  return (
                    <motion.div
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1 + i * 0.1,
                      }}
                      key={feature.title}
                      className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 min-w-[84%] sm:min-w-[60%] md:min-w-0 md:flex-1 md:bg-transparent md:backdrop-blur-xl transition-all duration-300 snap-center md:snap-none ${i === 3 ? 'lg:col-span-2 lg:col-start-2' : ''}`}
                    >
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center  justify-center rounded-2xl text-violet-200 text-base">
                          {isChat ? <Plus className="w-4 h-4" /> : feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                aria-label="Scroll left"
                onClick={() => {
                  const el = containerRef.current;
                  if (!el) return;
                  el.scrollBy({ left: -Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
                }}
                className={`md:hidden absolute -top-5 left-2 -translate-y-1/2 z-20 p-2 rounded-full text-white/75 bg-transparent backdrop-blur-sm transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                aria-label="Scroll right"
                onClick={() => {
                  const el = containerRef.current;
                  if (!el) return;
                  el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
                }}
                className={`md:hidden absolute -top-5 right-2 -translate-y-1/2 z-20 p-2 rounded-full text-white/75 bg-transparent backdrop-blur-sm transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
