// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [strength, setStrength] = useState("Weak");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password Strength Logic
  const checkStrength = (pwd) => {
    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8)
      return "Strong";
    return "Medium";
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setStrength(checkStrength(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) return setError("Please enter a new password.");

    try {
      setLoading(true);

      await axios.post("/api/auth/reset-password", {
        email,
        newPassword: password,
      });

      setSuccess("Password reset successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Strength bar color
  const strengthColor =
    strength === "Weak"
      ? "bg-red-500"
      : strength === "Medium"
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new secure password">
      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fadeIn flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password */}
        <div className="animate-slideInUp" style={{ animationDelay: "150ms" }}>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            New Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            <input
              type={show ? "text" : "password"}
              className="w-full pl-10 pr-12 py-3 border rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="********"
              value={password}
              onChange={handlePasswordChange}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* Password Strength Meter */}
        <div className="animate-slideInUp" style={{ animationDelay: "220ms" }}>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColor}`}
              style={{
                width:
                  strength === "Weak"
                    ? "33%"
                    : strength === "Medium"
                      ? "66%"
                      : "100%",
              }}
            />
          </div>
          <p
            className={`text-sm mt-1 ${
              strength === "Weak"
                ? "text-red-500"
                : strength === "Medium"
                  ? "text-yellow-600"
                  : "text-green-600"
            }`}
          >
            {strength} Password
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg flex justify-center items-center transition duration-300 disabled:opacity-50 animate-slideInUp"
          style={{ animationDelay: "300ms" }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
