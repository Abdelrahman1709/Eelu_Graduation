import { useEffect, useState } from "react";

const COOKIE_KEY = "itlala_cookie_status";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COOKIE_KEY);
    if (stored === "accepted" || stored === "declined") {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  const decide = (value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COOKIE_KEY, value);
    setVisible(false);
  };

  const dismiss = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COOKIE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4">
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl text-white md:flex-row md:items-center md:justify-between">
        <button
          onClick={dismiss}
          aria-label="Close cookie banner"
          className="absolute left-4 top-3 rounded px-2 py-1 text-sm text-slate-200 transition hover:text-white"
        >
          ×
        </button>

        <div className="min-w-0 pt-8">
          <h3 className="text-base font-semibold">We use cookies</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300 max-w-2xl">
            We use cookies to improve your experience. Accept cookies to enjoy the full site, or decline to continue with limited functionality.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={() => decide("declined")}
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            Decline
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
