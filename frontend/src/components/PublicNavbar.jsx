// src/components/PublicNavbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Leaf, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * PublicNavbar — navigation for public pages (Landing, About, Contact)
 * Supports smooth scrolling + dark/light mode + responsive design
 */
const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 🌿 Navigation links
  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // 🌿 Handle page + scroll navigation
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href.startsWith("/#")) {
      const id = href.replace("/#", ""); // ✅ correct substring
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🌿 Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 group"
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" aria-label="EcoTrack Logo" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent group-hover:opacity-80">
              EcoTrack
            </span>
          </Link>

          {/* 🌿 Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            {/* Auth Links */}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>

          {/* 🌿 Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-gray-700 dark:text-gray-300"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 🌿 Mobile Menu (Rendered conditionally for performance) */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 py-4 space-y-2 animate-fadeIn"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600"
            >
              {link.name}
            </a>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 mr-2 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 mr-2 text-blue-500" />
            )}
            Toggle Theme
          </button>

          {/* Auth Links */}
          <button
            onClick={() => {
              navigate("/login");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600"
          >
            Login
          </button>
          <button
            onClick={() => {
              navigate("/register");
              setMobileMenuOpen(false);
            }}
            className="mx-2 w-[calc(100%-1rem)] bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
