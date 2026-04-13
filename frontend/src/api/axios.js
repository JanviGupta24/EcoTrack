/* =============================================================================
 * Axios Client (JWT + Refresh Handling)
 * =============================================================================
 * Purpose:
 *   Centralize HTTP requests to the backend API with:
 *   - Base URL configuration from `REACT_APP_API_URL`
 *   - JWT `Authorization` header injection from local storage
 *   - Automatic refresh token flow on `401 Unauthorized`
 *
 Key Exports:
 *   - default export `api` (configured axios instance)
 *
 Security:
 *   - Avoid infinite retry loops via `_retry` guard.
 * ============================================================================= */
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                         🌍 BASE CONFIGURATION                               */
/* -------------------------------------------------------------------------- */
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Central Axios instance (JWT + Refresh Token)
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------------------------------------------------------------- */
/*                      🔐 REQUEST INTERCEPTOR                                 */
/* -------------------------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------------------------- */
/*                      🧠 RESPONSE INTERCEPTOR                                */
/* -------------------------------------------------------------------------- */
/**
 * Automatically refreshes access token on 401
 * Retries the request once
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we don't have a response (network error etc.), just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // ⛔ Do NOT try to refresh for auth flows where a 401 is expected
    //    (wrong password / registration / forgot-password / etc.)
    //    and prevent infinite retry loops using _retry flag
    if (
      status === 401 &&
      !(
        typeof originalRequest?.url === "string" &&
        [
          "/auth/logout",
          "/auth/login",
          "/auth/register",
          "/auth/google-login",
          "/auth/refresh",
          "/auth/me",
          "/auth/forgot-password",
          "/auth/verify-reset-otp",
          "/auth/reset-password",
          "/auth/send-otp",
          "/auth/verify-otp",
        ].some((p) => originalRequest.url.includes(p))
      ) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Use a plain axios call here to avoid interceptor recursion
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 6000,
          }
        );

        // Store new tokens
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        // Apply globally
        api.defaults.headers.common["Authorization"] =
          `Bearer ${data.accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        // 🔁 Retry the original failed request once
        return api(originalRequest);
      } catch (refreshError) {
        console.error("🔴 Refresh token failed:", refreshError.message);

        // Clean up local auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];

        // 🔔 Tell AuthContext to log out the user
        window.dispatchEvent(new Event("auth-error-logout"));

        return Promise.reject(refreshError);
      }
    }

    // Any other error → pass through
    return Promise.reject(error);
  }
);

export default api;
