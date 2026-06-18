export default function SoftBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Base background with radial gradients */}
      <div className="absolute inset-0" style={{background: 'radial-gradient(circle at top, rgba(99,102,241,0.14), transparent 35%), radial-gradient(circle at bottom right, rgba(236,72,153,0.18), transparent 25%), #020617'}} />
      {/* Additional gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-violet-900/10 to-transparent" />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[980px] h-[460px] bg-gradient-to-tr from-violet-700/45 via-violet-600/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute right-12 bottom-10 w-[420px] h-[220px] bg-gradient-to-bl from-fuchsia-700/45 to-transparent rounded-full blur-2xl" />
    </div>
  );
}