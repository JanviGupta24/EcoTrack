/* =============================================================================
 * Verify Reset OTP Page
 * =============================================================================
 * Purpose:
 *   Verify OTP submitted by the user as part of the password reset flow.
 *
 * Behavior:
 *   - Accepts email + OTP
 *   - Calls auth verify endpoint via `AuthContext.verifyResetOTP`
 *   - Redirects to the new password entry page
 * ============================================================================= */
import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Loader,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import api from "../api/axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getApiErrorMessage } from "../utils/errors";

const VerifyResetOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown for resend OTP
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP Submit
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp) return setError("Please enter OTP.");

    try {
      setLoading(true);

      await api.post("/auth/verify-reset-otp", { email, otp });

      setSuccess("OTP Verified! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 900);
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid OTP. Please check the code and try again."));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSuccess("OTP resent successfully!");
      setTimer(30);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to resend OTP. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`Enter the OTP sent to ${email}`}>
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fadeIn flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Input */}
        <div className="animate-slideInUp" style={{ animationDelay: "150ms" }}>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Enter OTP
          </label>

          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="6-digit OTP"
              className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg flex justify-center items-center transition duration-300 disabled:opacity-50 animate-slideInUp"
          style={{ animationDelay: "250ms" }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>

      {/* Resend OTP */}
      <div
        className="flex justify-between items-center mt-4 animate-slideInUp"
        style={{ animationDelay: "350ms" }}
      >
        <button
          onClick={handleResend}
          disabled={timer > 0 || resendLoading}
          className={`flex items-center text-blue-600 hover:underline font-medium ${
            timer > 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {resendLoading ? (
            <Loader className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1" />
          )}
          Resend OTP
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          {timer > 0 && `Resend in ${timer}s`}
        </span>
      </div>

      {/* Back */}
      <p
        className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideInUp"
        style={{ animationDelay: "450ms" }}
      >
        <Link
          to="/forgot-password"
          className="flex items-center justify-center text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyResetOTP;
