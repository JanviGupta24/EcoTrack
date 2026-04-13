/* =============================================================================
 * Login Page
 * =============================================================================
 * Purpose:
 *   Allow users to sign in using:
 *   - Email/password login
 *   - Optional Google OAuth login (when `REACT_APP_GOOGLE_CLIENT_ID` exists)
 *
 Key Behaviors:
 *   - Calls `AuthContext.login()` for email/password
 *   - Calls `AuthContext.googleLogin()` for Google OAuth
 *   - Redirects based on the authenticated user's role
 * ============================================================================= */
import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getApiErrorMessage } from "../utils/errors";

// ⭐ Import Google Login component
import { GoogleLogin } from "@react-oauth/google";

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      return setError("Please enter both email and password");
    }

    setLoading(true);
    try {
      const result = await login(formData);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          const role = result.user?.role;
          if (role === "admin" || role === "super_admin") {
            navigate("/app/admin", { replace: true });
          } else if (role === "worker") {
            navigate("/app/worker", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 1000);
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ⭐ REAL GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async (googleToken) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await googleLogin(googleToken);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");

        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setError(result.message || "Google login failed.");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Google login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue to EcoTrack">
      {/* Alerts */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn"
          role="alert"
        >
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div
          className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fadeIn"
          role="alert"
        >
          <div className="flex">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="animate-slideInUp" style={{ animationDelay: "100ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="animate-slideInUp" style={{ animationDelay: "200ms" }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
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
        </div>

        <div
          className="flex items-center justify-between animate-slideInUp"
          style={{ animationDelay: "300ms" }}
        >
          <label className="flex items-center">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg flex justify-center items-center transition duration-300 disabled:opacity-50 animate-slideInUp"
          style={{ animationDelay: "400ms" }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {googleClientId ? (
        <>
          <div
            className="relative my-6 animate-slideInUp"
            style={{ animationDelay: "500ms" }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div
            className="w-full flex items-center justify-center animate-slideInUp"
            style={{ animationDelay: "600ms" }}
          >
            <GoogleLogin
              onSuccess={(credentialResponse) =>
                handleGoogleLogin(credentialResponse.credential)
              }
              onError={() => setError("Google Login failed. Try again.")}
            />
          </div>
        </>
      ) : null}

      {/* Register */}
      <p
        className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideInUp"
        style={{ animationDelay: "700ms" }}
      >
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
