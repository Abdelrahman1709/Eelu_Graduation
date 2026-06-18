import { motion } from "framer-motion";
import Title from "../../../ui/Title";
import { Star } from "lucide-react";
import user1 from "../../../assets/users/Kamal.Aboueid.avif";
import user2 from "../../../assets/users/Ali.osama.avif";
import user3 from "../../../assets/users/Ibrahim.avif";
import user4 from "../../../assets/users/Abdulrahman.elsherbiby.avif";
import user5 from "../../../assets/users/Mohamed.fouly.avif";
import user6 from "../../../assets/users/mossad.elsayed.avif";

const testimonials = [
  {
    quote: "ITLALA made choosing outfits fast and fun — my daily style feels completely upgraded.",
    name: "Kamal Aboueid",
    role: "Software Engineer",
    image: user1,
  },{
    quote: "A clean interface that makes styling faster and more confident.",
    name: "mossad elsayed",
    role: "IT Engineer",
    image: user6,
  },

  {
    quote: "The wardrobe suggestions are so clean. I finally feel like my closet matches my taste.",
    name: "Ali Osama",
    role: "Machine Learning Engineer",
    image: user2,
  },
  {
    quote: "A modern styling experience that helps me dress smarter without wasting time.",
    name: "ibrahim Hisham",
    role: "back-end Engineer",
    image: user3,
  },
  {
    quote: "It feels like my entire closet was redesigned into a smarter system.",
    name: "abdulrahman elsherbiby",
    role: "Ai Engineer",
    image: user4,
  },
  
  {
    quote: "The app suggests outfits that actually match my mood and schedule.",
    name: "mohamed fouly",
    role: "engineer",
    image: user5,
  },
  
  {
    quote: "I love how the wardrobe feels curated and effortless now.",
    name: "Hassan Mahmoud",
    role: "DevOps Engineer",
    image: user1,
  },
  {
    quote: "ITLALA is the only styling tool I keep going back to every morning.",
    name: "omar ahmed",
    role: "Mobile Engineer",
    image: user2,
  },
].map((item) => ({
  ...item,
  rating: Math.floor(Math.random() * 2) + 4,
}));

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 md:py-20 2xl:py-32 overflow-hidden">
      <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <Title
          title="Confidence"
          heading="What people say"
          description="Real reactions from users who love the wardrobe experience and styling guidance."
        />

        <div className="overflow-hidden mt-8">
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: ["0%", "-50%", "0%"] }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity, repeatType: "loop" }}
            className="flex gap-6 sm:gap-7 md:gap-8"
          >
            {[...testimonials, ...testimonials].map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                className="min-w-[80%] sm:min-w-[280px] md:min-w-[280px] max-w-[320px] rounded-[32px] border border-white/10 bg-white/5 p-5 sm:p-6 shadow-2xl shadow-slate-950/30 transition-all duration-300"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-14 w-14 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <p className="font-semibold text-white text-base">{item.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400 mt-1">
                      {item.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`w-5 h-5 ${starIndex < item.rating ? "fill-amber-400 text-amber-400" : "text-white/30"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-200 leading-relaxed text-sm md:text-base mb-8 min-h-[110px]">
                  “{item.quote}”
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
