import { ArrowRightIcon } from "lucide-react";

import img2 from "../../../assets/home/images/img4.avif";
import { PrimaryButton } from "../../../components/Buttons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CheckIcon = () => (
  <svg
    width="22"
    height="23"
    viewBox="0 0 22 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11V12C22 18.0751 17.0751 23 11 23C4.92487 23 0 18.0751 0 12V11Z"
      fill="#8b5cf6"
    />
    <path
      d="M6.33203 12.6667L8.9987 15.3334L15.6654 8.66675"
      stroke="white"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FifthSlide = () => {
  // Animation for floating button

  const features = [
    "Instant trial in seconds.",
    "Complete privacy and security.",
    "Works with any outfit.",
  ];

  return (
    <section id="try-on" className="py-20 2xl:py-32 md">
      <div className="w-5xl md:max-w-3xl lg:max-w-7xl mx-auto px-4 ">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 70,
            mass: 1,
          }}
        >
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-xl 
                 bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] 
                 bg-clip-text text-transparent text-center md:text-left"
          >
            Try before you wear.
          </h1>
          <motion.div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mt-8">
            {/* text list left side */}
            <div className="flex flex-col items-start justify-center w-full md:w-1/3 order-1 md:order-1 md:mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 my-4 w-full"
                >
                  <CheckIcon className="text-white " />
                  <p className="w-full text-gray-300 ">{feature}</p>
                </div>
              ))}
            </div>
            {/* button section center */}
            <motion.div
              className="flex flex-col items-center justify-center w-full md:w-auto order-3  md:mt-[120px] mt-6 md:absolute"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Link to="/features/tryOn" className="w-full max-w-xs">
                <PrimaryButton className="w-full flex items-center justify-center gap-2  py-3 md:relative md:top-10">
                  Try Now <ArrowRightIcon size={18} />
                </PrimaryButton>
              </Link>
            </motion.div>

            {/* image section right side */}
            <div className="w-full md:w-1/3 flex items-center justify-center order-2 md:order-3">
              <img
                src={img2}
                alt="back-model"
                loading="lazy"
                className="w-56 md:w-64 lg:w-72 rounded-md"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FifthSlide;
