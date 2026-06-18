import { Check } from "lucide-react";

const steps = [
  { label: "Personal" },
  { label: "Account" },
  { label: "Gender" },
];

const RegistrationProgress = ({ currentStep = 1, isCurrentStepActive = true }) => {
  const effectiveStep = currentStep === 3 && !isCurrentStepActive ? 2 : currentStep;
  const progressWidth = ((effectiveStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 mb-8 shadow-lg shadow-slate-950/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-violet-400/80">
            Registration progress
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Step {currentStep} of {steps.length}
          </p>
        </div>
       
      </div>

      <div className="relative mt-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-slate-800 rounded-full" />
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" style={{ width: `${progressWidth}%` }} />
        <div className="relative flex items-center justify-between gap-3">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const completed = stepNumber < effectiveStep;
            const active = stepNumber === effectiveStep;

            return (
              <div key={step.label} className="flex flex-col items-center text-center min-w-[64px]">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    completed
                      ? "border-violet-500 bg-violet-500 text-white"
                      : active
                      ? "border-violet-400 bg-slate-900 text-violet-300 shadow-xl"
                      : "border-slate-700 bg-slate-900 text-slate-500"
                  }`}
                >
                  {completed ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${active ? "text-white" : "text-slate-500"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RegistrationProgress;
