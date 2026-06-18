import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import WardrobeFilters from "../../components/WardrobeFilters";
import WardrobeItem from "../../components/WardrobeItem";
import { useAuth } from "../../context/AuthContext";
import { X, Funnel, Sparkles, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWardrobe, removeFromWardrobe } from "../../services/wardrobeService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import UploadClothingModal from "../../components/UploadClothingModal";

function Wardrob() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // local UI state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTyping, setSearchTyping] = useState(false);
  const [season, setSeason] = useState("all");
  const [type, setType] = useState("all");
  const [color, setColor] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch wardrobe data
  const { data: wardrobe = [], isLoading: loading, error } = useQuery({
    queryKey: ["user-wardrobe"],
    queryFn: getWardrobe,
    enabled: !!user, // Only fetch if user is logged in
  });

  // Mutation for removing items
  const removeMutation = useMutation({
    mutationFn: removeFromWardrobe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wardrobe"] });
      toast.success("Item removed from wardrobe!", {
        position: "top-right",
        duration: 2000,
        style: {
          background: "linear-gradient(to right, #8b5cf6, #a855f7, #ec4899)",
          color: "white",
        },
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item", {
        position: "top-right",
        duration: 2000,
      });
    },
  });

  const handleRemove = (item) => {
    removeMutation.mutate(item._id);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSeason("all");
    setType("all");
    setColor("all");
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    setSearchTyping(true);
  };

  useEffect(() => {
    if (!searchTyping) return;

    const timer = setTimeout(() => {
      setSearchTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTyping]);

  const filtered = useMemo(() => {
    return wardrobe
      .filter((i) =>
        search
          ? i.subcategory?.toLowerCase().includes(search.toLowerCase()) ||
            i.name?.toLowerCase().includes(search.toLowerCase()) ||
            i.brand?.toLowerCase().includes(search.toLowerCase()) ||
            i.description?.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((i) => (season === "all" ? true : i.season === season))
      .filter((i) => {
        if (type === "all") return true;
        return i.subcategory === type || i.description?.toLowerCase().includes(type.toLowerCase());
      })
      .filter((i) => {
        if (color === "all") return true;
        const itemColor = (i.color || i.primaryColor || i.mainColor || "").toString().toLowerCase();
        const itemColors = Array.isArray(i.colors) ? i.colors.map((c) => c.toString().toLowerCase()) : [];
        return itemColor === color || itemColors.includes(color);
      });
  }, [wardrobe, search, season, type, color]);

  // =========================
  // PAGINATION
  // =========================
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const hasActiveFilters = useMemo(
    () => season !== "all" || type !== "all" || color !== "all",
    [season, type, color]
  );

  return (
    <section className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="space-y-4 mb-10">
  
          <div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">Your Personal Wardrobe</h1>
              <p className="max-w-3xl text-gray-300 text-base sm:text-lg mt-3">
                Upload your own clothing photos or explore the global wardrobe dataset to find matching styles and build your closet.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Camera className="w-4 h-4" />
                Upload Clothing
              </button>
              <button
                type="button"
                onClick={() => navigate('/MainWardrobe')}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                <Sparkles className="w-4 h-4" />
                Browse Global Wardrobe
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/15"
            >
              <Funnel className="w-4 h-4" />
               Filters
            </button>
          </div>
        </div>

          <div>
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className="fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="absolute inset-0 backdrop-blur-sm z-50"
                  onClick={() => setIsFilterOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.aside
                  className="absolute right-0 top-0 h-full w-full max-w-sm bg-transparent border-l border-white/10 shadow-2xl p-4 overflow-y-auto scrollbar-modern z-[51]"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 220, damping: 24, duration: 0.35 }}
                >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Filters</p>
                    <h2 className="text-lg font-semibold text-white">Refine wardrobe</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[32px] border border-white/10  p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-violet-300">refine</p>
                        <h2 className="text-xl font-semibold">Filter studio</h2>
                      </div>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs uppercase tracking-[0.28em] text-sky-300 hover:text-white transition"
                      >
                        Reset
                      </button>
                    </div>
                    <WardrobeFilters
                      search={search}
                      onSearch={handleSearch}
                      isSearching={searchTyping}
                      season={season}
                      onSeason={setSeason}
                      type={type}
                      onType={setType}
                      color={color}
                      onColor={setColor}
                    />
                  </div>
                  
                </div>
              </motion.aside>
              
            </motion.div>
          )}
          </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full py-2 text-xs uppercase tracking-[0.24em] text-violet-300 border border-white/10">
                  Premium closet
                </div>
               
              </div>

              <div className="rounded-3xl  px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Your Item</p>
                <p className="mt-2 text-2xl font-semibold text-white">{filtered.length}</p>
              </div>
            </div>

            {season !== "all" || type !== "all" || color !== "all" ? (
              <div className="flex flex-wrap gap-2">
                {[season, type, color]
                  .filter((value) => value !== "all")
                  .map((filter) => (
                    <span key={filter} className="inline-flex items-center rounded-full bg-white/10 px-3 py-2 text-xs text-white/90 border border-white/10">
                      {filter}
                    </span>
                  ))}
              </div>
            ) : null}

            {loading && (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-white/10 border-t-[#8b5cf6] animate-spin" />
                  </div>
                  <span className="text-gray-300 text-sm">Loading wardrobe...</span>
                </div>
              </div>
            )}
            {searchTyping && (
              <div className="flex justify-center items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="text-gray-300 text-sm">Searching...</span>
                </div>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.length === 0 ? (
                <div className="w-full text-center py-12 rounded-[32px] ">
                  <p className={`text-gray-300 text-sm sm:text-lg ${wardrobe.length === 0 ? "text-red-500" : ""} `}>
                    {wardrobe.length === 0
                      ? "Your wardrobe is empty !"
                      : "No items match your filters."}
                  </p>
                </div>
              ) : (
                pageItems.map((item) => (
                  <div key={item._id ?? item.id} className="group relative">
                    <button
                      onClick={() => handleRemove(item)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <WardrobeItem
                      item={item}
                      hideActions
                    />
                  </div>
                ))
              )}
            </div>

            {filtered.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(page - 1, totalPages - 2));
                    return startPage + i;
                  }).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-semibold transition ${
                        page === p
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                          : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>

                <div className="w-full text-center mt-4 text-sm text-gray-400">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      {/* Upload Clothing Modal */}
      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["user-wardrobe"] });
          setIsUploadOpen(false);
        }}
      />
  </section>
  );
}

export default Wardrob;