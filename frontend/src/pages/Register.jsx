/* =============================================================================
 * Register Page
 * =============================================================================
 * Purpose:
 *   Provide user registration with optional role selection and OTP verification
 *   flow (email and/or phone).
 *
 * Behavior:
 *   - Collects name/email/password/phone
 *   - Calls `AuthContext.register()` for account creation
 *   - Supports OTP verification via auth endpoints
 * ============================================================================= */

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  Shield,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

/**
 * Password Strength Indicator Component
 */
const PasswordStrengthMeter = ({ strength }) => {
  const levels = [
    { width: "0%", color: "bg-gray-200" },
    { width: "25%", color: "bg-red-500" },
    { width: "50%", color: "bg-yellow-500" },
    { width: "75%", color: "bg-blue-500" },
    { width: "100%", color: "bg-green-500" },
  ];

  const level = levels[strength] || levels[0];
  const text = ["None", "Very Weak", "Weak", "Good", "Strong"][strength];

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${level.color}`}
          style={{ width: level.width }}
        />
      </div>
      <p
        className={`text-xs mt-1 ${level.color
          .replace("bg", "text")
          .replace("-500", "-600 dark:text-gray-400")}`}
      >
        {strength > 0 && `Strength: ${text}`}
      </p>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    role: "user", // Default public role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [devMode, setDevMode] = useState(false); // 🔐 Developer Mode Toggle

  // --- Real-time Validation ---
  useEffect(() => {
    const errors = {};
    const { password, confirmPassword } = formData;

    let strength = 0;
    if (password.length > 0) strength++;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);

    if (password && password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setValidationErrors(errors);
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Submit Handler ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError("");

    if (Object.keys(validationErrors).length > 0) {
      setApiError("Please fix the errors in the form.");
      return;
    }
    if (!formData.agreedToTerms) {
      setApiError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const userPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        password: formData.password.trim(),
        role: formData.role || "user", // ✅ Always user by default
      };

      console.log("📤 Sending registration data:", userPayload);

      const result = await register(userPayload);

      if (result.success) {
        setTimeout(() => {
          const role = result.user?.role;
          if (role === "admin" || role === "super_admin") {
            navigate("/app/admin", { replace: true });
          } else if (role === "worker") {
            navigate("/app/worker", { replace: true });
          } else {
            navigate("/app/dashboard", { replace: true });
          }
        }, 1000);
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Registration Error:", err);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorClass = (fieldName) =>
    validationErrors[fieldName]
      ? "border-red-500"
      : "border-gray-300 dark:border-gray-600";

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join EcoTrack and make a difference"
    >
      {apiError && (
        <div
          className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn"
          role="alert"
        >
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{apiError}</span>
          </div>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleRegister}>
        {/* Full Name */}
        <div className="animate-slideInUp" style={{ animationDelay: "100ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white ${errorClass(
                "name"
              )}`}
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div className="animate-slideInUp" style={{ animationDelay: "200ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white ${errorClass(
                "email"
              )}`}
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="animate-slideInUp" style={{ animationDelay: "300ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white ${errorClass(
                "phone"
              )}`}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="animate-slideInUp" style={{ animationDelay: "350ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-3 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 appearance-none"
            >
              <option value="user">User</option>
              {devMode && (
                <>
                  <option value="worker">Worker</option>
                  <option value="green_champion">Green Champion</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </>
              )}
            </select>
            <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Developer Mode Toggle */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              onChange={() => setDevMode(!devMode)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              Developer mode (show hidden roles)
            </span>
          </div>
        </div>

        {/* Password */}
        {/* Password & Confirm Password Sections (unchanged from your code) */}

        <div className="animate-slideInUp" style={{ animationDelay: "400ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg dark:bg-gray-700 dark:text-white ${errorClass(
                "password"
              )}`}
              placeholder="Password (min. 8 characters)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <PasswordStrengthMeter strength={passwordStrength} />
          {validationErrors.password && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="animate-slideInUp" style={{ animationDelay: "500ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white ${errorClass(
                "confirmPassword"
              )}`}
              placeholder="Confirm Password"
            />
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <label
          className="flex items-start animate-slideInUp"
          style={{ animationDelay: "600ms" }}
        >
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            className="w-4 h-4 mt-1 text-blue-600 rounded"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{" "}
            <Link
              to="/terms"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg flex justify-center transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-slideInUp"
          style={{ animationDelay: "700ms" }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" /> Creating
              account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <p
        className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideInUp"
        style={{ animationDelay: "800ms" }}
      >
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
