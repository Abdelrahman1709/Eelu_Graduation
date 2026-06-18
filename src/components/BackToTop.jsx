import { useEffect, useState } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setShow(window.scrollY > 300);
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [bottomOffset, setBottomOffset] = useState(24);

  useEffect(() => {
    const updateBottom = () => {
      const footerHeight = 120;
      const windowBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setBottomOffset(windowBottom >= docHeight - footerHeight ? 120 : 24);
    };

    updateBottom();
    window.addEventListener("scroll", updateBottom, { passive: true });
    window.addEventListener("resize", updateBottom);
    return () => {
      window.removeEventListener("scroll", updateBottom);
      window.removeEventListener("resize", updateBottom);
    };
  }, []);

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={{ bottom: `${bottomOffset}px` }}
      className={`fixed right-5 z-20 w-[35px] h-[35px] bg-white/10 text-white p-3 rounded-[90%] shadow-lg shadow-black/15 border border-white/15 backdrop-blur-md transition-all duration-300 flex items-center justify-center ${
        show ? "opacity-90 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
