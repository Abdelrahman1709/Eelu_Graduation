import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email + Old Password, Step 2: New Password
  const [token, setToken] = useState(null); // Store token after verification
  
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Step 1: Verify email and current password
  async function handleVerifyCredentials(e) {
    e.preventDefault();

    if (!formData.email || !formData.currentPassword) {
      return toast.error("Please enter email and current password");
    }

    if (!validateEmail(formData.email)) {
      return toast.error("Please enter a valid email address");
    }

    if (formData.currentPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      
      // Try to login with provided credentials to verify
      const response = await fetch(
        "https://itlala.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.currentPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email or password is incorrect");
      }

      // Save token for password update
      setToken(data.accessToken);
      toast.success("Credentials verified! Now enter your new password.");
      setStep(2);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(
        err.message ||
          "Failed to verify credentials. If this email uses Google sign-in, please use Google login instead."
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Update password with new password
  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      return toast.error("Please enter and confirm new password");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (formData.newPassword === formData.currentPassword) {
      return toast.error("New password must be different from current password");
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        "https://itlala.up.railway.app/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully!");
      setFormData({
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 w-full max-w-5xl backdrop-blur-md border border-white/10">
        {/* LEFT SIDE */}
        <div className="text-white p-10 hidden md:flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-white bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-gray-300 max-w-xs">
            {step === 1
              ? "Verify your email and current password to continue"
              : "Enter your new password to complete the reset"}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {step === 1 ? "Step 1: Verify Your Identity" : "Step 2: Set New Password"}
          </h2>
          <p className="text-sm text-gray-300 mb-6">
            This reset flow is for email/password accounts only. If your account uses Google sign-in, please login using Google instead.
          </p>

          {/* STEP 1: EMAIL & CURRENT PASSWORD */}
          {step === 1 && (
            <form onSubmit={handleVerifyCredentials} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-3 pl-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* CURRENT PASSWORD */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] disabled:opacity-50"
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

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-95 transition disabled:opacity-60 font-semibold mt-6"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          )}

          {/* STEP 2: NEW PASSWORD */}
          {step === 2 && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter new password (min 6 characters)"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] disabled:opacity-50"
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

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] disabled:opacity-50"
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

              {/* UPDATE BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-95 transition disabled:opacity-60 font-semibold mt-6"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              {/* BACK BUTTON */}
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full border border-white/20 text-white py-3 rounded-lg hover:bg-white/5 transition duration-300 disabled:opacity-50 font-semibold mt-2"
              >
                Back
              </button>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-sm text-center mt-6 text-gray-300">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white font-semibold cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>

          {/* Back to Home */}
          <p className="text-sm text-center mt-4 text-gray-300">
            <Link to="/">
              <span className="text-gray-400 hover:text-white transition cursor-pointer">
                ← Back to Home
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
