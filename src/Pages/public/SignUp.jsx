import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import RegistrationProgress from "../../components/RegistrationProgress";
import RegisterForm from "../../components/RegisterForm";
import signImage from "../../assets/SignUp/Login.avif";
import toast from "react-hot-toast";
import { auth } from "../../firebase";

function SignUp() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAccountFormValid, setIsAccountFormValid] = useState(false);

  const handleContinue = (data) => {
    navigate("/gender-selection", {
      state: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  };

  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const fbUser = result?.user || auth.currentUser;
      if (!fbUser) throw new Error("No user returned from Google popup.");

      const idToken = await fbUser.getIdToken();

      const { user: userData, accessToken } = await loginWithGoogle({
        idToken,
        name: fbUser.displayName,
        email: fbUser.email,
        photo: fbUser.photoURL,
      });

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
    <div className="min-h-screen flex items-center justify-center p-4 mt-8">
      <div className="rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 max-w-7xl border-white/10">
        <div className="min-h-[460px] md:min-h-[auto]">
          <img
            src={signImage}
            alt="Sign Up"
            loading="lazy"
            className="w-full h-full min-h-[460px] object-cover"
          />
        </div>

        {/* form */}
        <div className="backdrop-blur-sm sm:p-10">
          <RegistrationProgress currentStep={2} isCurrentStepActive={isAccountFormValid} />
          <h2 className="text-2xl font-bold mb-6 text-white mt-2">
            Create Account
          </h2>

          <RegisterForm onContinue={handleContinue} onFormValid={setIsAccountFormValid} />

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
            aria-label="Sign up with Google Account"
            aria-busy={loading}
            title="Continue with your Google Account"
          >
            <FcGoogle size={20} aria-hidden="true" />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* redirect */}
          <p className="text-sm text-center mt-6 text-gray-300">
            <span
              onClick={() => navigate("/")}
              className="text-white font-semibold cursor-pointer hover:underline"
            >
              ← Back to Home
            </span>
          </p>
          <p className="text-sm text-center mt-2 text-gray-300">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white font-semibold cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}

export default SignUp;
