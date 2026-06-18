import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import RegistrationProgress from "../../components/RegistrationProgress";
import GenderSelectionPanel from "../../components/GenderSelectionPanel";
import signImage from "../../assets/SignUp/Login.avif";

function GenderSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedGender = watch("gender");
  const [genderSelected, setGenderSelected] = useState(selectedGender || "");
  const currentStep = 3;

  // UI states
  const [loading, setLoading] = useState(false);

  // Get email and name from previous step
  const email = location.state?.email;
  const password = location.state?.password;
  const firstName = location.state?.firstName;
  const lastName = location.state?.lastName;
  const fromGoogle = location.state?.from === "google";
  const token = location.state?.token;
  const googleUser = location.state?.user;

  // Fallback for redirect flow: if no location state, check localStorage
  let fallbackFromGoogle = false;
  let fallbackToken = token;
  let fallbackGoogleUser = googleUser;
  try {
    if (!fromGoogle) {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.gender == null) {
          fallbackFromGoogle = true;
          fallbackToken = fallbackToken || storedToken;
          fallbackGoogleUser = fallbackGoogleUser || parsed;
        }
      }
    }
  } catch (e) {
    // ignore JSON parse errors
  }

  const effectiveFromGoogle = fromGoogle || fallbackFromGoogle;
  const effectiveToken = fallbackToken;
  const effectiveGoogleUser = fallbackGoogleUser;

  // If arriving from Google and we have a user object, prefill name/email
  const googleName = effectiveGoogleUser?.name || "";
  const googleEmail = effectiveGoogleUser?.email || "";
  const [googleFirst, googleLast] = googleName.split(" ", 2).concat("");

  useEffect(() => {
    if (effectiveFromGoogle) return; // allow Google flow without email/password

    if (!email || !password || !firstName || !lastName) {
      navigate("/signup");
    }
  }, [email, password, firstName, lastName, navigate]);

  useEffect(() => {
    setGenderSelected(selectedGender || "");
  }, [selectedGender]);

  const onSubmit = async (data) => {
    if (!data.gender) {
      toast.error("Please choose your gender", {
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
      return;
    }

    try {
      setLoading(true);

      // If coming from Google or a saved Google user, update gender via PUT using the token
      if (effectiveFromGoogle && effectiveToken) {
        const res = await fetch("https://itlala.up.railway.app/api/auth/gender", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({ gender: data.gender }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Updating gender failed. Please try again.");
        }

        const updatedUser = {
          ...(result.user || { ...effectiveGoogleUser, gender: data.gender }),
          isGoogleAccount: true,
          authProvider: "google",
        };
        const accessToken = result.accessToken || effectiveToken;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        login(updatedUser, accessToken);

        toast.success("Profile updated successfully.", {
          position: "top-right",
          style: {
            background: "#8b5cf6",
            color: "#fff",
            marginTop: "10px",
          },
        });

        setTimeout(() => navigate("/"), 1000);

        return;
      }

      // Fallback: regular signup flow
      const res = await fetch("https://itlala.up.railway.app/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email: email,
          password: password,
          gender: data.gender,
        }),
      });

      const result = await res.json();
      if (result.message === "User already exists") {
        throw new Error("An account with this email already exists. Please try logging in instead.");
      }

      if (!res.ok) {
        throw new Error(result.message || "Registration failed. Please try again.");
      }

      const user = {
        name: `${firstName} ${lastName}`,
        email: email,
        gender: data.gender,
      };

      localStorage.setItem("token", result.accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      login(user);
      toast.success("Account created successfully! Welcome to ITLALA.", {
        position: "top-right",
        style: {
          background: "#8b5cf6",
          color: "#fff",
          marginTop: "10px",
        },
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.", {
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-8">
      <div className="rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 max-w-7xl border-white/10">
        <div className="min-h-[460px] md:min-h-[auto]">
          <img
            src={signImage}
            alt="Complete Sign Up"
            loading="lazy"
            className="w-full h-full min-h-[460px] object-cover"
          />
        </div>

        {/* form */}
        <div className="backdrop-blur-sm sm:p-10">
          <RegistrationProgress currentStep={currentStep} isCurrentStepActive={!!genderSelected} />
          <h2 className="text-2xl font-bold mb-6 text-white mt-2">
            Complete Your Profile
          </h2>

          <GenderSelectionPanel
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onSubmit={onSubmit}
            setValue={setValue}
            genderSelected={genderSelected}
            setGenderSelected={setGenderSelected}
            loading={loading}
          />

          {/* redirect */}
          <p className="text-sm text-center mt-6 text-gray-300">
            <span
              onClick={() => navigate("/signup")}
              className="text-white font-semibold cursor-pointer hover:underline"
            >
              ← Back to Email
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

export default GenderSelection;