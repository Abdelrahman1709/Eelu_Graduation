import React, { Suspense, lazy } from "react";
import FirstSlide from "./home/FirstSlide";
// const FeaturedCategories = lazy(() => import("./home/FeaturedCategories"));
const Testimonials = lazy(() => import("./home/Testimonials.jsx"));
const SecondSlide = lazy(() => import("./home/SecondSlide"));
const ThirdSlide = lazy(() => import("./home/ThirdSlide"));
const FourthSlide = lazy(() => import("./home/FourthSlide"));
const FifthSlide = lazy(() => import("./home/FifthSlide"));

function SectionFallback() {
  return (
    <div className="h-80 md:h-96 w-full rounded-3xl bg-white/5 animate-pulse" />
  );
}

function LandingPage() {
  return (
    <div>
      <FirstSlide />
      {/* <Suspense fallback={<SectionFallback />}>
        <FeaturedCategories />
      </Suspense> */}
      <Suspense fallback={<SectionFallback />}>
        <SecondSlide />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ThirdSlide />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FourthSlide />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FifthSlide />
      </Suspense>
    </div>
  );
}

export default LandingPage;
