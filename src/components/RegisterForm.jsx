import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FaEnvelope } from "react-icons/fa";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const RegisterForm = ({ onContinue, onFormValid }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    const validatePassword = (value) => {
      if (!value) return false;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      const isLongEnough = value.length >= 8;
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
    };

    const isFormValid =
      firstName &&
      lastName &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      validatePassword(password);

    if (onFormValid) {
      onFormValid(!!isFormValid);
    }
  }, [firstName, lastName, email, password, confirmPassword, onFormValid]);


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

  const onSubmit = (data) => {
    const validateName = (value) => {
      if (!value) return "This field is required";
      const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
      return nameRegex.test(value)
        ? true
        : "Use only letters and spaces";
    };

    const firstNameValidation = validateName(data.firstName);
    const lastNameValidation = validateName(data.lastName);

    if (firstNameValidation !== true) {
      toast.error(firstNameValidation, { position: "top-right" });
      return;
    }

    if (lastNameValidation !== true) {
      toast.error(lastNameValidation, { position: "top-right" });
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (passwordValidation !== true) {
      toast.error(passwordValidation, { position: "top-right" });
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match", { position: "top-right" });
      return;
    }

    onContinue(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder="First Name"
            {...register("firstName", {
              required: "First name is required",
              pattern: {
                value: /^[a-zA-Z\u0600-\u06FF\s'-]+$/,
                message: "Use only letters and spaces",
              },
            })}
            className="w-full border border-white/10 bg-white/5 text-white placeholder-gray-300 px-3 py-3 text-base md:text-sm md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
              pattern: {
                value: /^[a-zA-Z\u0600-\u06FF\s'-]+$/,
                message: "Use only letters and spaces",
              },
            })}
            className="w-full border border-white/10 bg-white/5 text-white placeholder-gray-300 px-3 py-3 text-base md:text-sm md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
          />
        </div>
      </div>

      {(errors.firstName || errors.lastName) && (
        <p className="text-red-400 text-sm">
          {errors.firstName?.message || errors.lastName?.message}
        </p>
      )}

      <div className="relative">
        <input
          type="email"
          placeholder="Email Address"
          {...register("email", { required: "Email is required" })}
          className="w-full border border-white/10 bg-white/5 text-white placeholder-gray-300 px-3 py-3 pr-10 text-base md:text-sm md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
        />
        <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {errors.email && (
        <p className="text-red-400 text-sm">{errors.email.message}</p>
      )}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
            validate: validatePassword,
          })}
          className="w-full border border-white/10 bg-white/5 text-white placeholder-gray-300 px-3 py-3 pr-10 text-base md:text-sm md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>
      {errors.password && (
        <p className="text-red-400 text-sm">{errors.password.message}</p>
      )}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
          })}
          className="w-full border border-white/10 bg-white/5 text-white placeholder-gray-300 px-3 py-3 pr-16 text-base md:text-sm md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>
      {errors.confirmPassword && (
        <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
      )}

      {password && validatePassword(password) !== true && (
        <div className="text-sm text-gray-300 p-3 rounded bg-white/5 border border-white/10">
          <div className="font-semibold mb-2">Password Requirements:</div>
          <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-400" : "text-red-400"}`}>
            <span>{/[A-Z]/.test(password) ? "✓" : "✗"}</span> Uppercase letter (A-Z)
          </div>
          <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? "text-green-400" : "text-red-400"}`}>
            <span>{/[a-z]/.test(password) ? "✓" : "✗"}</span> Lowercase letter (a-z)
          </div>
          <div className={`flex items-center gap-2 ${/\d/.test(password) ? "text-green-400" : "text-red-400"}`}>
            <span>{/\d/.test(password) ? "✓" : "✗"}</span> Number (0-9)
          </div>
          <div className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-400" : "text-red-400"}`}>
            <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "✓" : "✗"}</span> Special character (!@#$%^&*, etc.)
          </div>
          <div className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-400" : "text-red-400"}`}>
            <span>{password.length >= 8 ? "✓" : "✗"}</span> At least 8 characters
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-95 transition"
      >
        Continue
      </button>
    </form>
  );
};

export default RegisterForm;
