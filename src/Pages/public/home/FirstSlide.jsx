import { useEffect, useState } from "react";
import { ArrowRightIcon, PlayIcon, ZapIcon, CheckIcon } from "lucide-react";
import { PrimaryButton, GhostButton } from "../../../components/Buttons";
import { motion } from "framer-motion";
import mainImage from "../../../assets/home/images/mainImg1.avif";
import secMainImage from "../../../assets/home/images/mainImg2.avif";
import thirdMainImage from "../../../assets/home/images/mainImg3.avif";
import mainImgFourth from "../../../assets/home/images/mainImg4.avif";
import AnimatedText from "../../../ui/AnimatedText";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


export default function FirstSlide() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const galleryStripImages = [
    mainImage,
    secMainImage,
    thirdMainImage,
    mainImgFourth,
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryStripImages[selectedIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) =>
        prevIndex === galleryStripImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [galleryStripImages.length]);

  const handleGetStarted = () => {
    if (user) {
      navigate("/features/wardrobe");
    } else {
      navigate("/signup");
    }
  };

  const trustedLogosText = [
    "Fashion lovers",
    "Style seekers",
    "Modern professionals",
    "Trend-conscious brands",
    "Confident individuals",
  ];

  return (
    <>
      <section id="home" className="relative z-10">

        <div className="max-w-7xl mx-auto px-4 pt-14 md:pt-12 lg:pt-16 md:min-h-[90vh] max-md:overflow-hidden flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full md:pl-4 pl-0">
            {/* Left Content */}
            <div className="text-left">
              {/* Heading */}
              <motion.h1
                className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-xl bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  delay: 0.1,
                }}
              >
                ITLALA
              </motion.h1>

              <motion.div
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  delay: 0.15,
                }}
              >
                <AnimatedText />
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-gray-300 max-w-lg mb-8"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  mass: 1,
                  delay: 0.2,
                }}
              >
                Discover a smarter way to organize and choose your outfits
                effortlessly using AI technology.
              </motion.p>

              {/* Image for mobile only */}
              <motion.div
                className="md:hidden mx-auto mb-8 w-full max-w-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  mass: 1,
                  delay: 0.5,
                }}
              >
                <motion.div className="rounded-3xl overflow-hidden border border-white/6 shadow-2xl bg-gradient-to-b from-black/50 to-transparent backdrop-blur-md">
                  <div className="relative aspect-16/10 bg-gray-900 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="agency-work-preview"
                      width={1600}
                      height={1000}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </motion.div>

                <div className="mt-4 flex gap-3 items-center justify-center">
                  {galleryStripImages.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 70,
                        mass: 1,
                        delay: 0.1 + i * 0.1,
                      }}
                      onClick={() => setSelectedIndex(i)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border cursor-pointer transition-all flex items-center justify-center bg-gray-900 ${
                        selectedIndex === i
                          ? "border-white/60 ring-2 ring-blue-500"
                          : "border-white/6 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={src}
                        alt="project-thumbnail"
                        loading="lazy"
                        className="max-w-full max-h-full object-contain"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4 mb-8"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  mass: 1,
                  delay: 0.3,
                }}
              >
                <PrimaryButton onClick={handleGetStarted} className="max-sm:w-full py-2 px-5">
                  {user ? (
                    <>
                      Access Your Wardrobe
                      <ArrowRightIcon className="size-4" />
                    </>
                  ) : (
                    <>
                      Get started
                      <ArrowRightIcon className="size-4" />
                    </>
                  )}
                </PrimaryButton>
                <a href="#features" className="w-full sm:w-auto">
                  <GhostButton className="w-full sm:w-auto justify-center py-3 px-5">
                    <PlayIcon className="size-4" />
                    Learn More
                  </GhostButton>
                </a>
              </motion.div>

              {/* Features / Highlights */}
              <motion.div
                className="flex sm:inline-flex overflow-hidden items-center max-sm:justify-center text-sm text-gray-200 bg-white/10 rounded"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  mass: 1,
                  delay: 0.1,
                }}
              >
                <div className="flex items-center gap-2 p-2 px-3 sm:px-6.5 hover:bg-white/3 transition-colors">
                  <ZapIcon className="size-4 text-sky-500" />
                  <div>
                    <div>Style-powered recommendations</div>
                    <div className="text-xs text-gray-400">
                      Personalized outfits for every occasion
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block h-6 w-px bg-white/6" />

                <div className="flex items-center gap-2 p-2 px-3 sm:px-6.5 hover:bg-white/3 transition-colors">
                  <CheckIcon className="size-4 text-cyan-500" />
                  <div>
                    <div>Complete style experience</div>
                    <div className="text-xs text-gray-400">
                      Smart matching, trends & personalization
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content: Image Card */}
            <motion.div
              className="hidden md:block mx-auto w-full max-w-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 70,
                mass: 1,
                delay: 0.5,
              }}
            >
              <motion.div className="rounded-3xl overflow-hidden border border-white/6 shadow-2xl bg-gradient-to-b from-black/50 to-transparent backdrop-blur-md">
                <div className="relative aspect-16/10 bg-gray-900">
                  <img
                    src={selectedImage}
                    alt="agency-work-preview"
                    width={1600}
                    height={1000}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-contain object-center"
                  />

                  <div className="absolute left-4 top-4 px-3 py-1 rounded-full bg-black/15 backdrop-blur-sm text-xs">
                    Branding • Web • Growth
                  </div>

                  <div className="absolute right-4 bottom-4">
                    <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/6 backdrop-blur-sm hover:bg-white/10 transition focus:outline-none">
                      <PlayIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              <div className="mt-4 flex gap-3 items-center justify-start">
                {galleryStripImages.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 70,
                      mass: 1,
                      delay: 0.1 + i * 0.1,
                    }}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-14 h-10 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      selectedIndex === i
                        ? "border-white/60 ring-2 ring-blue-500"
                        : "border-white/6 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={src}
                      alt="project-thumbnail"
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ))}
                <motion.div
                  className="text-sm text-gray-400 ml-2 flex items-center gap-2"
                  initial={{ y: 60, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 70,
                    mass: 1,
                    delay: 0.2,
                  }}
                >
                  <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75 animate-ping duration-300" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#7c3aed]" />
                  </div>
                  Real Virtual Try-On Experience
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <motion.section
        className="border-y border-white/6 bg-white/1 md:mt-2 mt-6"
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full overflow-hidden py-6">
            <div className="flex gap-14 items-center justify-center animate-marquee whitespace-nowrap">
              {trustedLogosText.concat(trustedLogosText).map((logo, i) => (
                <span
                  key={i}
                  className="mx-6 text-sm md:text-base font-semibold text-gray-400 hover:text-gray-300 tracking-wide transition-colors"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}