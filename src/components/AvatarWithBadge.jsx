import React from "react";

// Props:
// - src: image url
// - alt: alt text
// - size: 'sm' | 'md' | 'lg' (default 'md')
// - badgeCount: number (optional) to show inside badge
// - showDot: boolean (optional) show small dot instead of count
// - className: additional classes for container

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function AvatarWithBadge({
  src,
  alt = "avatar",
  size = "md",
  shape = "circle",
  badgeCount = 0,
  showDot = false,
  className = "",
}) {
  const sizeCls = sizeMap[size] || sizeMap.md;
  const shapeCls = shape === "square" ? "rounded-2xl" : "rounded-full";
  const showBadge = showDot || (typeof badgeCount === "number" && badgeCount > 0);

  return (
    <div className={`relative inline-block ${className}`}>
      <img src={src} alt={alt} className={`object-cover ${shapeCls} ${sizeCls}`} />

      {showBadge && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold`}
          style={{
            minWidth: showDot ? 8 : 20,
            height: showDot ? 8 : 20,
            padding: showDot ? 0 : "0 6px",
            fontSize: showDot ? 8 : 12,
          }}
          aria-hidden
        >
          {!showDot && badgeCount > 99 ? "99+" : showDot ? "" : badgeCount}
        </span>
      )}
    </div>
  );
}
