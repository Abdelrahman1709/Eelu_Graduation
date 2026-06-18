import { motion, AnimatePresence } from "framer-motion";
// import { useState } from "react";

export default function AnimatedText() {
  // const [show, setShow] = useState(true);

  return (
    <div className="overflow-hidden w-full  py-2">
      <motion.div
        className="flex whitespace-nowrap text-white text-lg"
        animate={{ x: ["0%", "-90%"] }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "linear",
        }}
      >
        <div className="flex gap-8 px-8  mx-auto">
          Smart Outfit Recommendations.
        </div>
      </motion.div>
    </div>
  );
}
