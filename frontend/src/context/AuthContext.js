// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /*                          🚀 INITIAL AUTH CHECK                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    checkAuth();

    // Listen for forced logout triggered by axios interceptor
    const handler = () => logout(false); // skip API call
    window.addEventListener("auth-error-logout", handler);

    return () => window.removeEventListener("auth-error-logout", handler);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              ✅ CHECK AUTH                                  */
  /* -------------------------------------------------------------------------- */
  const checkAuth = async () => {
    try {
      let token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      // Attempt to decode
      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        token = await handleRefresh();
        decoded = jwtDecode(token);
      }

      // Check expiration
      if (decoded.exp * 1000 < Date.now()) {
        token = await handleRefresh();
      }

      // Set header for all calls
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      logout(false); // silent local logout
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                ✅ LOGIN                                     */
  /* -------------------------------------------------------------------------- */
  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);

      persistTokens(data);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              ✅ REGISTER                                    */
  /* -------------------------------------------------------------------------- */
  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);

      persistTokens(data);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           ✅ GOOGLE LOGIN                                   */
  /* -------------------------------------------------------------------------- */
  const googleLogin = async (token) => {
    try {
      const { data } = await api.post("/auth/google-login", { token });

      persistTokens(data);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Google login failed",
      };
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                        🔁 REFRESH TOKEN HANDLER                              */
  /* -------------------------------------------------------------------------- */
  const handleRefresh = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) throw new Error("Missing refresh token");

      const { data } = await api.post("/auth/refresh", {
        refreshToken: refresh,
      });

      persistTokens(data);
      return data.accessToken;
    } catch (err) {
      logout(false);
      throw err;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                      💾 STORE TOKENS + HEADERS                              */
  /* -------------------------------------------------------------------------- */
  const persistTokens = (data) => {
    if (data.accessToken)
      localStorage.setItem("accessToken", data.accessToken);

    if (data.refreshToken)
      localStorage.setItem("refreshToken", data.refreshToken);

    api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
  };

  /* -------------------------------------------------------------------------- */
  /*                                🚪 LOGOUT                                     */
  /* -------------------------------------------------------------------------- */
  const logout = async (callApi = true) => {
    try {
      if (callApi) {
        await api.post("/auth/logout"); // ignore errors
      }
    } catch (err) {
      console.warn("Logout API failed:", err.message);
    }

    // Clear tokens locally
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];

    setUser(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                           🔄 UPDATE USER LOCALLY                             */
  /* -------------------------------------------------------------------------- */
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
