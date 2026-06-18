import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Camera,
  Shirt,
  Menu,
  X,
  Sparkles,
  Trash2,
  Heart,
  BarChart3,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavbar } from "../../context/NavbarContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getWardrobe } from "../../services/wardrobeService";
import { updateProfilePhoto } from "../../services/userService";
import { normalizeUserData } from "../../utils/authUtils";
import ImageEditModal from "../../components/ImageEditModal";
import { apiCall } from "../../utils/apiClient";
import { NavLink, useNavigate } from "react-router-dom";
import menAvatar from "../../assets/Gender/men.avif";
import womenAvatar from "../../assets/Gender/woman.avif";
import logoAvatar from "../../assets/Logo/Logo.avif";

const Profile = () => {
  const { user: authUser, logout, login } = useAuth();
  const { hideNavbar, showNavbar } = useNavbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [displayUser, setDisplayUser] = useState(authUser);

  useEffect(() => {
    if (authUser) {
      setDisplayUser(authUser);
    }
  }, [authUser]);

  const { data: queryUser } = useQuery({
    queryKey: ["user-profile", authUser?.email || authUser?.id || authUser?._id || "current"],
    queryFn: () => authUser,
    enabled: !!authUser,
    initialData: authUser,
    staleTime: 0,
    refetchOnMount: true,
  });

  const user = displayUser || queryUser || authUser;
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    if ((isMobile || isTablet) && sidebarOpen) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [sidebarOpen, isMobile, isTablet, hideNavbar, showNavbar]);

  const { data: wardrobe = [] } = useQuery({
    queryKey: ["user-wardrobe"],
    queryFn: getWardrobe,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const getDefaultAvatar = (gender) => {
    if (gender === "male") return menAvatar;
    if (gender === "female") return womenAvatar;
    return logoAvatar;
  };

  const formatJoinedDate = (iso) => {
    const dateString = iso || user?.joinedAt || user?.created_at || user?.registeredAt;
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  const getRelativeSince = (iso) => {
    const dateString = iso || user?.joinedAt || user?.created_at || user?.registeredAt;
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const sidebarLinks = [
    { label: "Dashboard", to: "/features/dashboard", icon: User, description: "Personal style hub" },
    { label: "Wardrobe", to: "/features/wardrobe", icon: Shirt, description: "Browse your closet" },
    { label: "Try-On", to: "/features/tryOn", icon: Sparkles, description: "Virtual outfit preview" },
    { label: "Edit Profile", to: "/features/edit-profile", icon: Edit3, description: "Update your account" },
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const [editingFile, setEditingFile] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingFile(file);
    setIsImageModalOpen(true);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please drop a valid image file');
      return;
    }
    setEditingFile(file);
    setIsImageModalOpen(true);
  };

  const handleImageSave = async (dataUrl) => {
    const toastId = toast.loading("Preparing image...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const updatedUserData = await updateProfilePhoto(dataUrl);
      const updatedUser = normalizeUserData({ ...(user || {}), ...updatedUserData });
      login(updatedUser);
      setDisplayUser(updatedUser);
      if (queryClient) {
        const userKey = ["user-profile", updatedUser?.email || updatedUser?.id || updatedUser?._id || "current"];
        queryClient.setQueryData(userKey, updatedUser);
        queryClient.setQueryData(["user-profile"], updatedUser);
        queryClient.invalidateQueries({ queryKey: userKey });
      }
      toast.success("Profile photo updated successfully", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to update profile photo", { id: toastId });
      console.error("Error updating profile photo:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setEditingFile(null);
      setIsImageModalOpen(false);
    }
  };

  const performDeleteAccount = async () => {
    try {
      await apiCall("/auth/delete-account", { method: "DELETE" });
      setShowDeleteModal(false);
      logout();
      navigate("/login");
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const classificationCount = user?.stats?.classification || 0;
  const recommendationCount = user?.stats?.recommendation || 0;
  const virtualTryOnCount = user?.stats?.virtualTryOn || 0;
  const itemCount = wardrobe.length;
  const totalAiUsage = classificationCount + recommendationCount + virtualTryOnCount;

  const profileScore = Math.max(
    0,
    itemCount + classificationCount * 2 + recommendationCount * 3 + virtualTryOnCount * 4
  );

  const aiStats = [
    { label: "Classification", value: classificationCount, icon: Zap, color: "text-amber-300" },
    { label: "Recommendations", value: recommendationCount, icon: Heart, color: "text-rose-300" },
    { label: "Try-Ons", value: virtualTryOnCount, icon: Sparkles, color: "text-sky-300" },
  ];

  return (
    <div className="min-h-screen text-white pt-20 ">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-2 py-2 rounded-xl  bg-white/5 hover:bg-white/10 transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <AnimatePresence>
            {(sidebarOpen || !isMobile) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className={`space-y-6 ${isMobile ? "fixed inset-0 top-20 z-50 w-full max-w-sm backdrop-blur-md p-5 overflow-y-auto" : ""}`}
              >
                {/* Profile Card */}
                <div className="rounded-3xl border border-white/10 p-6 backdrop-blur-xl relative">
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:text-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <div className="flex flex-col items-center text-center">
                    {/* Centered Avatar */}
                    <div
                      className="relative inline-flex items-center justify-center rounded-full p-1 border-2 border-dashed border-white/20 group"
                      onDrop={handleAvatarDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <img
                        src={user?.photo || getDefaultAvatar(user?.gender)}
                        alt="Avatar"
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-slate-950"
                      />
                    </div>
                    
                    {/* Change Button - Under & Slightly Left */}
                    <div className="w-28 flex justify-start -mt-1 translate-x-3 z-10">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] text-white/80 hover:text-white transition  shadow-md border border-white/5"
                        >
                          <Edit3 className="w-3 h-3" />
                          Change
                        </button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    
                    <h2 className="mt-5 text-xl font-semibold text-white tracking-tight">{user?.name || "User"}</h2>
                    <p className="mt-1 text-sm text-slate-400 truncate w-full">{user?.email}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-violet-200 border border-violet-500/20 shadow-inner">
                       <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                      Premium Member
                    </div>
                  </div>

                  <div className="mt-7 space-y-4 border-t border-white/5 pt-6">
                    {[
                      { icon: Mail, value: user?.email },
                      { icon: Calendar, value: `Joined ${formatJoinedDate(user?.createdAt)}`, extra: getRelativeSince(user?.createdAt) },
                      { icon: User, value: user?.gender || "Not specified", capitalize: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 text-sm text-slate-300">
                        <div className="text-violet-300">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className={`truncate ${item.capitalize ? 'capitalize' : ''}`}>
                          {item.value}
                          {item.extra && <span className="ml-2 text-slate-500">({item.extra})</span>}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={() => navigate("/features/edit-profile")}
                      className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-violet-800/40 px-4 py-3 text-sm font-semibold text-white transition "
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {(isMobile || isTablet) && sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}

          <main className="space-y-6">
            {/* Welcome Header */}
            <div className="rounded-3xl border border-slate-800 p-8  shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
            
                  <h1 className="text-4xl font-bold mt-2.5 tracking-tight text-white">Hello, {user?.name?.split(" ")[0] || "Stylist"} 👋</h1>
                  <p className="text-slate-400 mt-2.5 max-w-2xl text-base">Welcome back to your premium style hub. Here are your wardrobe insights at a glance.</p>
                </div>
                
                {/* Wardrobe Quick Stats */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 shrink-0">
                  {[
                    { label: "Items", value: itemCount, icon: Shirt },
                    { label: "AI Uses", value: totalAiUsage, icon: Sparkles },
                    { label: "Score", value: profileScore, icon: Heart },
                  ].map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-700/50 p-4 min-w-[90px] md:min-w-[110px] text-center shadow-md">
                      <div className="flex justify-center mb-2">
                        <item.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="text-3xl font-extrabold text-white">{item.value}</p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mt-1.5 font-medium truncate">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Usage Section - Professionally Integrated */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className=" p-1.5 rounded-2xl  shadow-inner">
                        <BarChart3 className="w-7 h-7 text-violet-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-white tracking-tight">AI Usage Activity</h2>
                        <p className="text-slate-400 text-sm mt-0.5">Overview of your interactions with our fashion AI engine.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {aiStats.map((stat, index) => (
                        <div key={index} className="relative rounded-2xl border  border-white/10  p-6 flex items-start  gap-4 shadow-md group hover:border-violet-500/30 transition duration-300">
                             <div className="p-3 rounded-xl text-violet-300">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-4xl font-bold text-white tracking-tight">{stat.value.toLocaleString()}</p>
                                <p className="text-sm font-medium text-slate-400 mt-1 truncate">{stat.label}</p>
                                <p className="text-xs text-slate-600 mt-0.5 group-hover:text-slate-500 transition">Total requests processed</p>
                            </div>
                             <div className="absolute top-4 right-4 text-violet-900 group-hover:text-violet-900 transition">
                                <BarChart3 className="w-10 h-10" />
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Add New Clothing", icon: Shirt, onClick: () => navigate('/features/wardrobe'), desc: "Expand your closet" },
                { label: "My Wardrobe", icon: Heart, onClick: () => navigate('/features/wardrobe'), desc: "Browse collection" },
                { label: "Explore Trends", icon: Sparkles, onClick: () => navigate('/MainWardrobe'), desc: "Global styles" },
                { label: "Virtual Try-On", icon: Camera, onClick: () => navigate('/features/tryOn'), desc: "Preview outfits" },
              ].map((card, idx) => (
                <button 
                  key={idx} 
                  onClick={card.onClick} 
                  className="rounded-3xl border border-slate-800 p-6 flex flex-col items-start gap-4 transition duration-200 ease-out  hover:shadow-xl shadow-lg group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="rounded-xl p-3 text-violet-300 transition duration-200 group-hover:text-violet-100">
                      <card.icon className="w-5 h-5" />
                    </span>
                    <Sparkles className="w-4 h-4 text-slate-400 transition group-hover:text-violet-300" />
                  </div>
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-white group-hover:text-violet-100 transition">{card.label}</p>
                    <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition">{card.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </main>

          {/* Image editor modal */}
          <ImageEditModal
            isOpen={isImageModalOpen}
            onClose={() => { setIsImageModalOpen(false); setEditingFile(null); }}
            imageFile={editingFile}
            aspect={"1:1"}
            title={"Edit Profile Photo"}
            onSave={handleImageSave}
          />

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4backdrop-blur-sm">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-slate-900/90 border border-red-500/30 backdrop-blur-2xl text-white rounded-3xl p-7 z-[101] w-full max-w-md shadow-2xl shadow-red-500/10"
              >
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <Trash2 className="w-7 h-7" />
                    <h3 className="text-2xl font-bold">Delete Account</h3>
                </div>
                <p className="text-sm text-slate-300 mb-7 leading-relaxed">
                  This action is permanent and <span className="font-semibold text-red-300">cannot</span> be undone. All your wardrobe data, photos, and settings will be erased immediately.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button 
                    onClick={() => setShowDeleteModal(false)} 
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
                  >
                    Cancel, keep it
                  </button>
                  <button 
                    onClick={performDeleteAccount} 
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold transition shadow-lg shadow-red-600/20"
                  >
                    Yes, Delete Permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

