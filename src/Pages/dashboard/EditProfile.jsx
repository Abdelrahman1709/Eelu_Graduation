import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, User, Lock, Eye, EyeOff, Camera } from "lucide-react";
import ImageEditModal from "../../components/ImageEditModal";
import { updateProfilePhoto, updateName } from "../../services/userService";
import { normalizeUserData } from "../../utils/authUtils";
import toast from "react-hot-toast";
import menAvatar from "../../assets/Gender/men.avif";
import womenAvatar from "../../assets/Gender/woman.avif";
import logoAvatar from "../../assets/Logo/Logo.avif";

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getDefaultAvatar = (gender) => {
    if (gender === "male") return menAvatar;
    if (gender === "female") return womenAvatar;
    return logoAvatar;
  };

  const isGoogleAccount =
    user?.isGoogleAccount ||
    user?.authProvider === "google" ||
    user?.provider === "google" ||
    user?.google;

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
  });

  const [editingFile, setEditingFile] = useState(null);
  const [editingType, setEditingType] = useState("avatar");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const avatarInputRef = useRef(null);

  const handleImageSelect = (file) => {
    if (!file) return;
    setEditingType("avatar");
    setEditingFile(file);
    setIsImageModalOpen(true);
  };

  const handleImageSave = async (dataUrl) => {
    try {
      const updatedUserData = await updateProfilePhoto(dataUrl);
      const updatedUser = normalizeUserData({ ...(user || {}), ...updatedUserData });
      login(updatedUser);
      if (queryClient) {
        const userKey = ["user-profile", updatedUser?.email || updatedUser?.id || updatedUser?._id || "current"];
        queryClient.setQueryData(userKey, updatedUser);
        queryClient.setQueryData(["user-profile"], updatedUser);
      }
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update image');
    } finally {
      setEditingFile(null);
      setIsImageModalOpen(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (value) => {
    if (!value) return true;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const isLongEnough = value.length >= 8;

    if (!isLongEnough) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter (A-Z)";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter (a-z)";
    if (!hasNumbers) return "Password must contain at least one number (0-9)";
    if (!hasSpecialChar) return "Password must contain at least one special character (!@#$%^&*, etc.)";
    return true;
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    if (!fullName) {
      toast.error("Please enter both first and last names.");
      setLoading(false);
      return;
    }

    try {
      const result = await updateName(fullName);
      const updatedUser = { ...(user || {}), ...result, name: fullName };
      login(updatedUser);
      toast.success("Name updated successfully!");
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // allow the toast to appear briefly, then navigate to profile page
      setTimeout(() => navigate("/profile-user"), 900);
    } catch (err) {
      toast.error(err.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return toast.error("Please fill in all password fields");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (passwordValidation !== true) {
      return toast.error(passwordValidation);
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      return toast.error("New password must be different from current password");
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://itlala.up.railway.app/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to change password";
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json().catch(() => ({}));
      
      toast.success("Password changed successfully!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        {/* Profile image section */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative rounded-full ring-1 ring-white/10 overflow-hidden w-32 h-32">
              <img src={user?.photo || getDefaultAvatar(user?.gender)} alt="avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15 shadow-lg shadow-slate-950/20"
            >
              change profile photo
            </button>
            <p className="text-sm text-slate-400 max-w-md">
               Click on the buttom and select you profile photo.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {/* Edit Name Section */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <User className="w-5 h-5 text-violet-400" />
              Change Name
            </h2>

            <form onSubmit={handleNameChange} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Name"}
              </button>
            </form>
          </div>

          {/* Email Display */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-violet-400" />
              Email Address
            </h2>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-2">
                Contact support to change your email
              </p>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Lock className="w-5 h-5 text-violet-400" />
              {isGoogleAccount ? "Password managed by Google" : "Change Password"}
            </h2>

            {isGoogleAccount ? (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-gray-200">
                <p className="mb-3">
                  This account is linked to Google sign-in, so password changes must be handled through your Google account settings.
                </p>
                <p className="text-sm text-gray-400">
                  If you want to change how you sign in, use the Google login flow or update your password through Google.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10"
                    placeholder="Enter new password "
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
            )}
          </div>
        </div>
        <ImageEditModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageFile={editingFile}
          aspect={editingType === 'avatar' ? '1:1' : '16:9'}
          title={editingType === 'avatar' ? 'Edit Profile Photo' : 'Edit Cover Image'}
          onSave={handleImageSave}
        />
      </div>
    </div>
  );
};

export default EditProfile;