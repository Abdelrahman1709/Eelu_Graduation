import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import LoginImage from "../../assets/SignUp/Login.avif";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Please fill in all fields", { position: "top-right" });
    }

    if (!validateEmail(form.email)) {
      return toast.error("Invalid email format - please enter a valid email address", { position: "top-right" });
    }

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters", { position: "top-right" });
    }

    try {
      setLoading(true);
      const res = await fetch("https://itlala.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        const statusError = res.status >= 500
          ? "Login failed. Please try again later."
          : "Email or password is incorrect. Please check your credentials.";
        throw new Error(statusError);
      }

      const user = result.user;
      localStorage.setItem("token", result.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      login(user);

      toast.success("Welcome back! Login successful.", { position: "top-right" });

      setLoading(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error(err.message, { position: "top-right" });
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const fbUser = result?.user || auth.currentUser;
      if (!fbUser) throw new Error("No user returned from Google popup.");

      const idToken = await fbUser.getIdToken();

      const loginResponse = await loginWithGoogle({
        idToken,
        name: fbUser.displayName,
        email: fbUser.email,
        photo: fbUser.photoURL,
      });

      const userData = loginResponse?.user;
      const accessToken = loginResponse?.accessToken;
      const backendPayload = loginResponse?.backendPayload;

      if (!userData) {
        const backendSummary = backendPayload ? JSON.stringify(backendPayload).slice(0, 200) : "<no-backend-payload>";
        throw new Error(`Google login did not return user information. Backend: ${backendSummary}`);
      }

      if (userData?.gender == null) {
        toast.success("Signed in with Google. Complete your profile.");
        navigate("/gender-selection", {
          state: {
            from: "google",
            user: userData,
            token: accessToken,
          },
        });
        return;
      }

      toast.success("Signed in with Google successfully.");
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Google sign-in failed.", {
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 w-full max-w-7xl border border-white/10">
        <div>
          <img src={LoginImage} alt="Login" loading="lazy" className="w-full h-full object-cover" />
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
                {form.email && (
                  validateEmail(form.email) ? (
                    <CheckCircle className="absolute right-3 top-3 text-green-400" size={20} />
                  ) : (
                    <AlertCircle className="absolute right-3 top-3 text-red-400" size={20} />
                  )
                )}
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 text-white border border-white/10 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 cursor-pointer text-gray-300 hover:text-white transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="text-right text-sm">
              <Link to="/forgot-password" className="text-gray-300 hover:text-white">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60">
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-white/20" />
            <span className="text-sm text-gray-300">or</span>
            <span className="h-px w-16 bg-white/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full border border-white/10 bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-white/15 transition disabled:opacity-60 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <FcGoogle size={20} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-sm text-center mt-6 text-gray-300">
            <span onClick={() => navigate("/")} className="text-white font-semibold cursor-pointer hover:underline">← Back to Home</span>
          </p>
          <p className="text-sm text-center mt-2 text-gray-300">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")} className="text-white cursor-pointer">Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;