"use client";

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "@studio-freight/lenis";

export default function LenisScroll() {
  const { pathname } = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      // شلنا الـ duration: 0 عشان نسمح للـ Lerp يشتغل بنعومة
      lerp: 0.1, // قيمة بين 0.05 لـ 0.1 ممتازة للنعومة
      wheelMultiplier: 1,
      gestureOrientation: "vertical",
      normalizeWheel: true, // مهم جدًا لتوحيد سرعة السكرول بين الماوس والتاتش باد
      smoothWheel: true,
      // التاتش يفضل تسيبه false إلا لو محتاجه ضروري، لأن المتصفحات بتتعامل معاه أحسن
      smoothTouch: false, 
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // إضافة مهمة: تصفير السكرول عند تغيير الصفحة (React Router)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}