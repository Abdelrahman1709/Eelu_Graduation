import React, { memo, useState } from "react";
import {
  Search as SearchIcon,
  User,
  Users,
  Sun,
  Snowflake,
  Calendar,
  Shirt,
  Gift,
  Package,
} from "lucide-react";
import { PiBaby } from "react-icons/pi";

function WardrobeFilters({
  search,
  onSearch,
  isSearching,
  season,
  onSeason,
  type,
  onType,
  color,
  onColor,
}) {
  const [focused, setFocused] = useState(false);


  const seasonOptions = [
    { value: "all", label: "All year", icon: <Calendar className="size-4" /> },
    { value: "summer", label: "Summer", icon: <Sun className="size-4" /> },
    { value: "winter", label: "Winter", icon: <Snowflake className="size-4" /> },
  ];

  const typeOptions = [
    { value: "all", label: "All types", icon: <Shirt className="size-4" /> },
    { value: "t-shirt", label: "T-shirt", icon: <Shirt className="size-4" /> },
    { value: "hoodie", label: "Hoodie", icon: <Shirt className="size-4" /> },
    { value: "dresses", label: "Dresses", icon: <Shirt className="size-4" /> },
    { value: "jacket", label: "Jacket", icon: <Shirt className="size-4" /> },
    { value: "pants", label: "Pants", icon: <Package className="size-4" /> },
    { value: "tank top", label: "Tank top", icon: <Shirt className="size-4" /> },
    { value: "jeans", label: "Jeans", icon: <Package className="size-4" /> },
    { value: "shorts", label: "Shorts", icon: <Gift className="size-4" /> },
  ];

  const colorOptions = [
    { value: "all", label: "All colors", color: null },
    { value: "black", label: "Black", color: "#000000" },
    { value: "white", label: "White", color: "#FFFFFF" },
    { value: "red", label: "Red", color: "#EF4444" },
    { value: "blue", label: "Blue", color: "#3B82F6" },
    { value: "green", label: "Green", color: "#10B981" },
    { value: "yellow", label: "Yellow", color: "#F59E0B" },
    { value: "purple", label: "Purple", color: "#8B5CF6" },
    { value: "pink", label: "Pink", color: "#EC4899" },
    { value: "gray", label: "Gray", color: "#6B7280" },
    { value: "brown", label: "Brown", color: "#92400E" },
  ];

  const pillClass = (active) =>
    `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
        : "bg-white/10 text-gray-200 hover:bg-white/20"
    }`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          {isSearching ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
              if (!focused) setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onClick={() => setFocused(true)}
            onBlur={() => {
              if (!search) setFocused(false);
            }}
            placeholder="Search items by name, brand or style"
            className={`w-full ${focused ? "py-3" : "py-2"} pl-10 pr-3 rounded-3xl bg-white/10 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ease-out border border-white/10`}
          />
        </div>
        <p className="text-xs text-gray-400">Fast search with live filters to find the right look.</p>
      </div>


      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Season</p>
          <span className="text-xs text-gray-400">{season === "all" ? "All" : season}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {seasonOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={pillClass(season === opt.value)}
              onClick={() => onSeason(opt.value)}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Type</p>
          <span className="text-xs text-gray-400">{type === "all" ? "All" : type}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={pillClass(type === opt.value)}
              onClick={() => onType(opt.value)}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Color story</p>
          <span className="text-xs text-gray-400">{color === "all" ? "All" : color}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition ${
                color === opt.value
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/10 text-gray-200 hover:bg-white/20"
              }`}
              onClick={() => onColor?.(opt.value)}
            >
              {opt.color ? (
                <span
                  className="inline-block h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: opt.color }}
                />
              ) : (
                <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-white/20 text-[10px] text-gray-200">A</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(WardrobeFilters);

