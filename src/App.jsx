import { Suspense, useMemo, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { NavbarProvider } from "./context/NavbarContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./App/Router";
import { Toaster, toast } from "react-hot-toast";
import logoImg from "./assets/Logo/Logo.avif";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Loading from "./components/Loading";
import CookieConsentBanner from "./components/CookieConsentBanner";

// Session expiration handler component
function SessionExpiredHandler() {
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Your session has expired. Please log in again.", {
        duration: 4000,
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  return null;
}

function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 5 }, // 5 minutes
        },
      }),
    []
  );

  return (
    <div className="min-h-screen flex flex-col ">
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3200,
          className: "rounded-[18px] shadow-2xl shadow-slate-950/40 sm:rounded-[22px] max-w-[90vw] sm:max-w-[360px]",
          bodyClassName: "font-medium text-sm sm:text-base tracking-tight",
          icon: (
            <div style={{ 
              width: 36, 
              height: 36, 
              minWidth: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
              <img src={logoImg} alt="logo" style={{ width: 20, height: 20, objectFit: "contain", filter: "brightness(1.2)" }} />
            </div>
          ),
          style: {
            borderRadius: "18px",
            background: "rgba(15, 23, 42, 0.96)",
            color: "#f8f7ff",
            padding: "11px 13px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.3)",
            fontSize: "0.95rem",
            maxWidth: "calc(100vw - 20px)",
            minWidth: "auto",
            width: "fit-content",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          },
          success: { style: { background: "linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(37, 99, 235, 0.9))" } },
          error: { style: { background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))", color: "#fff" } },
          loading: { style: { background: "linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(16, 185, 129, 0.9))", color: "#fff" } },
          iconTheme: { primary: "#f8f7ff", secondary: "rgba(255,255,255,0.15)" },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionExpiredHandler />
          <NavbarProvider>
            <Suspense fallback={<Loading />}>
              <RouterProvider router={router} />
            </Suspense>
            <CookieConsentBanner />
          </NavbarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
