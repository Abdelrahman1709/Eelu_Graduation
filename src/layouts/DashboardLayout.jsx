import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SoftBackdrop from "../ui/SoftBackdrop";

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isBackdropPage =
    location.pathname.includes("/features/tryOn") ||
    location.pathname === "/tryon" ||
    location.pathname.includes("/features/wardrobe") ||
    location.pathname === "/features/wardrobe" ||
    location.pathname === "/profile-user" ||
    location.pathname.includes("/features/edit-profile");

  return (
    <div className={`relative min-h-screen text-white flex flex-col overflow-hidden `}>
      <SoftBackdrop />
      {/* Keep a dark overlay for dashboard pages, but skip it for pages that should show the backdrop */}
      {!isBackdropPage && <div className="absolute inset-0 bg-slate-950/85" />}

      {/* Main Content */}
      <div className="relative flex-1 overflow-auto z-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;