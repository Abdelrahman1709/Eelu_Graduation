import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Funnel } from "lucide-react";

import WardrobeFilters from "../../../../components/WardrobeFilters";
import WardrobeItem from "../../../../components/WardrobeItem";
import Loading from "../../../../components/Loading";
import toast from "react-hot-toast";

import { useAuth } from "../../../../context/AuthContext";
import { getMainWardrobe } from "../../../../services/MainWardrobeService";
import { addToWardrobe, getWardrobe } from "../../../../services/wardrobeService";

export default function PublicWardrobe() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTyping, setSearchTyping] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const genderMap = {
    male: "men",
    female: "women",
  };

  const Gender = genderMap[user?.gender] || "men";

  // =========================
  // GET MAIN WARDROBE
  // =========================
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["main-wardrobe", Gender],
    queryFn: () => getMainWardrobe(Gender),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // =========================
  // USER WARDROBE
  // =========================
  const { data: userWardrobe = [] } = useQuery({
    queryKey: ["user-wardrobe"],
    queryFn: getWardrobe,
    enabled: !!token,
  });

  // =========================
  // ADD TO WARDROBE MUTATION
  // =========================
  const addMutation = useMutation({
    mutationFn: addToWardrobe,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wardrobe"] });

      toast.success("Added to your wardrobe!", {
        position: "top-right",
        duration: 2000,
        style: {
          background: "linear-gradient(to right, #8b5cf6, #a855f7, #ec4899)",
          color: "white",
        },
      });
    },

    onError: (error) => {
      toast.error(error.message || "Failed to add item", {
        position: "top-right",
        duration: 2000,
      });
    },
  });

  // =========================
  // FILTER LOGIC
  // =========================
  const filteredItems = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = search
        ? item.subcategory?.toLowerCase().includes(search.toLowerCase()) ||
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.brand?.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesCategory =
        item.gender === Gender;

      const matchesSeason =
        seasonFilter === "all" ||
        (Array.isArray(item.season)
          ? item.season.includes(seasonFilter)
          : item.season === seasonFilter);

      const matchesType =
        typeFilter === "all" ||
        (Array.isArray(item.subcategory)
          ? item.subcategory.includes(typeFilter)
          : item.subcategory === typeFilter) ||
        (item.description &&
          item.description.toLowerCase().includes(typeFilter.toLowerCase()));

      const matchesColor =
        colorFilter === "all" ||
        (item.description &&
          item.description.toLowerCase().includes(colorFilter.toLowerCase())) ||
        (Array.isArray(item.color)
          ? item.color.includes(colorFilter)
          : item.color === colorFilter);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeason &&
        matchesType &&
        matchesColor
      );
    });
  }, [data, search, seasonFilter, typeFilter, colorFilter]);

  // =========================
  // PAGINATION
  // =========================
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

  const startIndex = (page - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(startIndex, startIndex + PAGE_SIZE);

  // =========================
  // HANDLERS
  // =========================
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

  const handleAddToWardrobe = (item) => {
    if (!token) {
      toast.error("Please log in first!");
      return;
    }

    const exists = userWardrobe.some((w) => w._id === item._id);

    if (exists) {
      toast.error("Already in wardrobe!");
      return;
    }

    addMutation.mutate(item._id);
  };

  // =========================
  // UI
  // =========================
  return (
    <section className="min-h-screen text-white bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),transparent_25%),#020617]">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="space-y-4 mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Explore & add to wardrobe</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">Global Wardrobe</h1>
              <p className="max-w-3xl text-gray-300 text-base sm:text-lg mt-3 capitalize">
                 Find Your Similler Items Thats in Your Real wardrobe and Add to Your Personal Wardrobe 
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="self-end inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20 max-w-[110px]"
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
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setIsFilterOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.aside
                  className="absolute right-0 top-0 h-full w-full max-w-sm bg-transparent border-l border-white/10 shadow-2xl p-4 overflow-y-auto scrollbar-modern"
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
                    <div className="rounded-[32px] border border-white/10 bg-transparent p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-violet-300">refine</p>
                          <h2 className="text-xl font-semibold">Filter studio</h2>
                        </div>
                        <button
                          onClick={() => {
                            setSearch("");
                            setSeasonFilter("all");
                            setTypeFilter("all");
                            setColorFilter("all");
                          }}
                          className="text-xs uppercase tracking-[0.28em] text-sky-300 hover:text-white transition"
                        >
                          Reset
                        </button>
                      </div>
                      <WardrobeFilters
                        search={search}
                        onSearch={handleSearch}
                        isSearching={searchTyping}
                        season={seasonFilter}
                        onSeason={setSeasonFilter}
                        type={typeFilter}
                        onType={setTypeFilter}
                        color={colorFilter}
                        onColor={setColorFilter}
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
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-300 border border-white/10">
                Main collection
              </div>
             
            </div>

            <div className="rounded-3xl  px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Total Item</p>
              <p className="mt-2 text-2xl font-semibold text-white">{filteredItems.length}</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-white/10 border-t-[#8b5cf6] animate-spin" />
                </div>
                <span className="text-gray-300 text-sm">Loading items...</span>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.length === 0 ? (
              <div className="w-full text-center py-12 rounded-[32px] border border-white/10 bg-white/5">
                <p className="text-gray-300 text-sm sm:text-lg">
                  {data.length === 0
                    ? "No items available"
                    : "No items match your filters."}
                </p>
              </div>
            ) : (
              pageItems.map((item) => (
                <WardrobeItem
                  key={item._id}
                  item={item}
                  onAdd={handleAddToWardrobe}
                  isInWardrobe={userWardrobe.some((w) => w._id === item._id)}
                />
              ))
            )}
          </div>

          {filteredItems.length > 0 && (
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
    </section>
  
  )
};
