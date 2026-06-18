import { motion } from "framer-motion";
import Title from "../../../ui/Title";
import { MessageSquare, Sparkles, MirrorRound, ShelvingUnit, Bookmark, ArrowRight } from "lucide-react";

const featureCards = [
  {
    id: "01",
    title: "Smart Chat Assistant",
    description: "Ask the AI for outfit ideas, styling tips, and fast wardrobe advice anytime.",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    id: "02",
    title: "AI Recommendations",
    description: "Get tailored outfit suggestions based on your wardrobe, mood, and the occasion.",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "03",
    title: "Virtual Try-On",
    description: "Preview looks before you wear them with an intuitive virtual fitting experience.",
    icon: <MirrorRound className="w-4 h-4" />,
  },
  {
    id: "04",
    title: "Main Wardrobe",
    description: "Keep your core collection organized, searchable, and ready for every plan.",
    icon: <ShelvingUnit className="w-4 h-4" />,
  },
  {
    id: "05",
    title: "Your Personal Closet",
    description: "Save your favorite looks and access your user wardrobe effortlessly.",
    icon: <Bookmark className="w-4 h-4" />,
  },
];

export default function FeaturedCategories() {
  return (
    <section id="categories" className="py-20 2xl:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <Title
          title="Featured"
          heading="Core wardrobe features"
          description="Explore the smart tools behind ITLALA: chat guidance, outfit recommendations, virtual try-on, and instant wardrobe control."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {featureCards.map((category, index) => (
            <motion.div
              key={category.id}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  delay: 0.05 + index * 0.08,
                }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-lg p-6 shadow-lg shadow-violet-500/5 cursor-pointer transition-all duration-300 hover:border-white/35 hover:shadow-xl hover:shadow-violet-500/15 h-full flex flex-col"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-600/20 to-fuchsia-500/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Number badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/8 border border-white/15 text-xs font-bold text-white/70 group-hover:text-white group-hover:border-white/40 group-hover:bg-white/12 transition-all duration-300">
                      {category.id}
                    </span>
                  </div>

                  {/* Title and description */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-2 group-hover:text-white transition-colors duration-300 line-clamp-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-400/90 text-xs leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {category.description}
                    </p>
                  </div>

                  {/* Icon and arrow */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 text-white/60 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/25 transition-all duration-300">
                      {category.icon}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Hover border line */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-violet-400 to-violet-500 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
