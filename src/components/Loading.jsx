      // 
export default function Loading() {
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-[#8b5cf6] animate-spin" />
          <div className="absolute inset-0 rounded-full border border-white/20" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
