import React, { Suspense, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import SoftBackdrop from "../ui/SoftBackdrop";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import Loading from "../components/Loading";

function Layout() {
  const location = useLocation();
  const hideNavbarPaths = ["/signUp", "/login"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  const navigate = useNavigate();

  // Global handler for anchor hash links: smooth-scroll when on landing page,
  // or navigate to landing page and then scroll if clicked from another route.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || !href.startsWith("#") || target === "_blank") return;

      const id = href.slice(1);
      // If we're already on the landing page, smooth-scroll to target
      if (location.pathname === "/") {
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // update hash without jumping
          window.history.replaceState(null, "", href);
        }
        return;
      }

      // Otherwise navigate to landing page with hash
      e.preventDefault();
      navigate(`/${href}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [location, navigate]);

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // When location.hash present, attempt smooth scroll after route change
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    // small delay to allow the target element to mount
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <div className="flex flex-col w-full ">
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <BackToTop/>
      <div className="flex flex-col flex-grow">
        <main className={`flex-grow w-full ${showNavbar ? "pt-16 md:pt-24" : ""}`}>
          
          <SoftBackdrop />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
