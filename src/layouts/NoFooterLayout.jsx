import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SoftBackdrop from "../ui/SoftBackdrop";

const NoFooterLayout = ({ children }) => {
  const location = useLocation();

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <SoftBackdrop />
      <div className="absolute inset-0 bg-slate-950/85" />
      <main className="relative min-h-screen w-full z-10">
        {children}
      </main>
    </div>
  );
};

export default NoFooterLayout;
