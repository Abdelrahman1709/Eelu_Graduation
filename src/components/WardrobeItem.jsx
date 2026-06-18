import React from "react";
import { PrimaryButton } from "./Buttons";
import { User, Users, Shirt, Gift } from "lucide-react";

function iconForItem(item) {
  if (!item) return <Users className="size-5" />;
  if (item.type === "accessories") return <Gift className="size-5" />;
  if (item.type === "dresses") return <Shirt className="size-5" />;
  if (item.category === "men") return <User className="size-5" />;
  if (item.category === "women") return <User className="size-5" />;
  return <Users className="size-5" />;
}

function WardrobeItem({ item, onAdd, isInWardrobe = false, hideActions = false }) {
  if (!item) {
    return (
      <div className="rounded-[26px] border border-white/10 bg-white/5 p-3 shadow-2xl min-h-[320px] animate-pulse" />
    );
  }

  return (
    <div className="group relative rounded-[26px] border border-white/10 bg-transparent shadow-2xl overflow-hidden transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(99,102,241,0.18)]">
      <div className="relative overflow-hidden bg-transparent">
        <img
          src={item.imageUrl || item.image}
          alt={item.subcategory || item.name}
          loading="lazy"
          className="w-full h-48 object-contain transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {item.usage || "Everyday"}
        </div>
      </div>

      <div className="bg-transparent backdrop-blur-sm p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white leading-tight">
            {item.subcategory || item.name}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2">
            {item.description || item.usage || "Clean, sharp wardrobe item."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-300">
          <span className="rounded-2xl bg-white/10 px-3 py-2">{item.category || "General"}</span>
          <span className="rounded-2xl bg-white/10 px-3 py-2">{item.season || "All Season"}</span>
        </div>

        {!hideActions && (
          <PrimaryButton
            className={`w-full py-3 rounded-xl transition-all duration-200 ${isInWardrobe ? "bg-transparent text-white cursor-not-allowed opacity-70" : "bg-transparent text-white hover:bg-white/10 hover:scale-102"}`}
            onClick={() => !isInWardrobe && onAdd && onAdd(item)}
            disabled={isInWardrobe}
          >
            {isInWardrobe ? "Already Added" : "Add to Wardrobe"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

export default React.memo(WardrobeItem);
// import React from "react";
// import { PrimaryButton } from "./Buttons";

// export default function WardrobeItem({ item, onPreview, onAdd }) {
//   return (
//     <div className="bg-white/10 rounded-xl overflow-hidden">

//       {/* IMAGE */}
//       <div onClick={onPreview} className="cursor-pointer">
//         <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
//       </div>

//       {/* INFO */}
//       <div className="p-3">
//         <h3 className="text-white">{item.name}</h3>
//         <p className="text-gray-300 text-xs">
//           {item.category} / {item.season}
//         </p>

//         {/* BUTTON */}
//         <PrimaryButton
//           className="w-full mt-2"
//           onClick={(e) => {
//             e.stopPropagation();
//             onAdd(item);
//           }}
//         >
//           Add
//         </PrimaryButton>
//       </div>
//     </div>
//   );
// }