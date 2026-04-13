/* =============================================================================
 * Navbar Component
 * =============================================================================
 * Purpose:
 *   Render the top navigation bar with:
 *   - Role-aware navigation links
 *   - Notification dropdown (in-app)
 *   - Mobile navigation menu
 *   - User profile/logout controls
 *
 Key Dependencies:
 *   - `frontend/src/context/AuthContext` for auth state and actions
 *   - `frontend/src/api/services` for notification fetching
 * ============================================================================= */

import React, { useState, useEffect } from "react";
import {
  Leaf,
  Home,
  FileText,
  BookOpen,
  Trophy,
  Wallet,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Briefcase,
  Settings,
  Inbox,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { notificationService } from "../api/services";
import Loader from "./Loader";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNots, setLoadingNots] = useState(false);

  // 🌿 Smooth scroll for landing sections
  const scrollToSection = (id) => {
    const executeScroll = () => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    };

    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(executeScroll, 700); // wait for DOM render
    } else {
      executeScroll();
    }
    setMobileMenuOpen(false);
  };

  // 🌿 Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNots(true);
    try {
      const response = await notificationService.getNotifications({ limit: 5 });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoadingNots(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  // 🌿 Role-based dashboard links
  const roleBasedLinks = {
    user: [
      { to: "/app/dashboard", icon: Home, label: "Dashboard" },
      { to: "/app/report-waste", icon: FileText, label: "Report Waste" },
      { to: "/app/reports", icon: FileText, label: "My Reports" },
      { to: "/app/training", icon: BookOpen, label: "Training" },
      { to: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
      { to: "/app/wallet", icon: Wallet, label: "Wallet" },
    ],
    worker: [
      { to: "/app/worker", icon: Briefcase, label: "Dashboard" },
      { to: "/app/reports", icon: FileText, label: "Assignments" },
      { to: "/app/training", icon: BookOpen, label: "Training" },
    ],
    admin: [
      { to: "/app/admin", icon: Settings, label: "Admin Panel" },
      { to: "/app/reports", icon: FileText, label: "All Reports" },
      { to: "/app/training", icon: BookOpen, label: "Training" },
    ],
    super_admin: [
      { to: "/app/admin", icon: Settings, label: "Admin Panel" },
      { to: "/app/reports", icon: FileText, label: "All Reports" },
      { to: "/app/training", icon: BookOpen, label: "Training" },
    ],
    green_champion: [
      { to: "/app/champion/dashboard", icon: Home, label: "Dashboard" },
      {
        to: "/app/champion/reports",
        icon: FileText,
        label: "Community Reports",
      },
      { to: "/app/champion/events", icon: Trophy, label: "Events" },
      { to: "/app/champion/resources", icon: BookOpen, label: "Resources" },
    ],
  };

  // ✅ Safe fallback if role is missing
  const links = roleBasedLinks[user?.role] || roleBasedLinks["user"];

  // 🌍 PUBLIC NAVBAR (Not logged in)
  if (!user) {
    return (
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* 🌿 Logo */}
          <div
            className="flex items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EcoTrack
            </span>
          </div>

          {/* 🌍 Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700 dark:text-gray-300 font-medium">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-blue-600 transition"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-blue-600 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="hover:text-blue-600 transition"
            >
              Testimonials
            </button>
            <button
              onClick={() => navigate("/about")}
              className="hover:text-blue-600 transition"
            >
              About
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
          </div>

          {/* 🌗 Right Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started
            </button>
          </div>

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* 📱 Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left hover:text-blue-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left hover:text-blue-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left hover:text-blue-600"
            >
              Testimonials
            </button>
            <button
              onClick={() => navigate("/about")}
              className="block w-full text-left hover:text-blue-600"
            >
              About
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="block w-full text-left hover:text-blue-600"
            >
              Contact
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>
    );
  }

  // 🔐 DASHBOARD NAVBAR (Logged in)
  return (
    <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🌿 Logo */}
          <div
            className="flex items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleNav("/app/dashboard")}
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EcoTrack
            </span>
          </div>

          {/* 🌍 Dashboard Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => handleNav(link.to)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mr-2 ${isActive ? "text-blue-600" : ""}`}
                  />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* 🌗 Right Icons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) fetchNotifications();
                }}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNots ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader size="md" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        <Inbox className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                            !notif.isRead
                              ? "bg-blue-50 dark:bg-blue-900/50"
                              : ""
                          }`}
                        >
                          <div className="flex items-start">
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {notif.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleNav("/app/notifications")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-300 dark:border-gray-700">
              <img
                src={
                  user?.avatar
                    ? user.avatar
                    : (() => {
                        const name = user?.name || "User";
                        const parts = name.trim().split(" ");
                        const first = parts[0]?.charAt(0) || "";
                        const last =
                          parts.length > 1
                            ? parts[parts.length - 1].charAt(0)
                            : "";
                        const initials = (first + last).toUpperCase();
                        return `https://ui-avatars.com/api/?name=${initials}&background=10b981&color=fff&bold=true`;
                      })()
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full ring-2 ring-green-500 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleNav("/app/profile")}
              />
              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role?.replace("_", " ")}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-800 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
