import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";
import signImage from "../../assets/SignUp/Login.avif";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return toast.error("Please enter your email address.");
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://itlala.up.railway.app/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link. Please try again.");
      }

      toast.success(data.message || "Password reset link sent to your email.");
      setSent(true);
    } catch (error) {
      console.error("[ForgotPassword] Error:", error);
      toast.error(error.message || "Failed to send reset link.");
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
            alt="Forgot Password"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="backdrop-blur-sm sm:p-10 p-6 bg-slate-950/80">
          <h2 className="text-3xl font-bold mb-4 text-white">Forgot Password</h2>
          <p className="text-sm text-gray-300 mb-8">
            Enter your account email and we will send you a password reset link.
          </p>

          {sent ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-gray-100">
              <p className="mb-4 font-semibold text-white">Link sent!</p>
              <p className="text-sm text-gray-300 mb-6">
                If the email exists in our system, a reset link has been sent. Check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-95 transition"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-4 text-gray-300" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-sm text-center mt-4 text-gray-300">
                Remembered your password?{' '}
                <Link to="/login" className="text-white font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
