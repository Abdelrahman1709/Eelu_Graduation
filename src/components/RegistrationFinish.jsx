const RegistrationFinish = ({ gender }) => {
  if (!gender) return null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-200">
      <p className="text-white font-semibold">Final step: keep your data safe</p>
      <p className="mt-3 text-slate-400">
        You selected {gender === "male" ? "a male look" : "a female look"}. This helps ITLALA personalize your style, visuals, and experience.
      </p>
      <p className="mt-3 text-slate-400">
        Your information is stored securely and only used to improve your experience inside ITLALA.
      </p>
      <p className="mt-3 text-slate-400">
        We do not share this with third parties without your consent. Click "Complete Sign Up" to finish.
      </p>
    </div>
  );
};

export default RegistrationFinish;
