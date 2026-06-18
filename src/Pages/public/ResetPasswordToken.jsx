import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import signImage from "../../assets/SignUp/Login.avif";

const ResetPasswordToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch(
        `https://itlala.up.railway.app/api/auth/reset-password/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired reset token.");
      }

      setStatus({
        type: "success",
        message: data.message || "Password reset successfully.",
      });
      toast.success(data.message || "Password reset successfully.");
      setPassword("");
      setTimeout(() => navigate("/login"), 1600);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Invalid or expired token. Please request a new reset link.",
      });
      toast.error(error.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-8">
      <div className="rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 w-full max-w-7xl border border-white/10">
        <div className="hidden md:block">
          <img
            src={signImage}
            alt="Reset Password"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="backdrop-blur-sm sm:p-10 p-6 bg-slate-950/80">
          <h2 className="text-3xl font-bold mb-4 text-white">Reset Password</h2>
          <p className="text-sm text-gray-300 mb-8">
            Enter your new password and confirm the reset. The token is read from the URL.
          </p>

          {status.type === "error" && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 mb-6 text-red-100">
              <p className="font-semibold">{status.message}</p>
              <p className="text-sm mt-2 text-gray-300">
                If the link is invalid or expired, request a new one from the forgot password page.
              </p>
            </div>
          )}

          {status.type === "success" ? (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-100">
              <p className="font-semibold mb-3">{status.message}</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-95 transition"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-sm text-center mt-4 text-gray-300">
                <Link to="/forgot-password" className="text-white font-semibold hover:underline">
                  Request a new reset link
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordToken;
