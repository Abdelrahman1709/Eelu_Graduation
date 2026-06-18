import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function PageNotFound() {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-full place-items-center bg-slate-950 px-6 py-24 sm:py-32 lg:px-8">

        <p className="text-base font-semibold text-violet-300">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-7xl">Page not found</h1>
        <p className="mt-6 text-lg font-medium text-slate-400 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-violet-500 hover:to-fuchsia-400"
          >
            Go back home
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/profile-user")}
            className="text-sm font-semibold text-slate-100 hover:text-white"
          >
            Back to profile <ArrowRight className="w-4 h-4 inline" />
          </button>
        </div>
       
    </main>
  );
}

export default PageNotFound;
