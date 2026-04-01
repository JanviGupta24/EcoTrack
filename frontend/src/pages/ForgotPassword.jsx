// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) return setError("Please enter your email address.");

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/forgot-password", { email });

      setSuccess("OTP sent to your email!");
      setTimeout(() => {
        navigate("/verify-reset-otp", { state: { email } });
      }, 900);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to send reset OTP. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we will send a reset OTP"
    >
      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fadeIn">
          <div className="flex">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="animate-slideInUp" style={{ animationDelay: "150ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg flex justify-center items-center transition duration-300 disabled:opacity-50 animate-slideInUp"
          style={{ animationDelay: "250ms" }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>

      {/* Back to Login */}
      <p
        className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideInUp"
        style={{ animationDelay: "350ms" }}
      >
        <Link
          to="/login"
          className="flex items-center justify-center text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
