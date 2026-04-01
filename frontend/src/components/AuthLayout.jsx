// src/components/AuthLayout.jsx
import React from "react";
import { Leaf } from "lucide-react";

/**
 * @component AuthLayout
 * Provides a consistent layout for authentication pages (Login, Register).
 * It includes a soft gradient background, animated entry, and a centered card.
 *
 * Props:
 * - title: Main heading
 * - subtitle: Secondary text below title
 * - children: Form or content inside the auth card
 */
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Card Container */}
      <div className="max-w-md w-full animate-slideInUp transition-all duration-700">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4 shadow-lg animate-pulse">
            <Leaf className="w-8 h-8 text-white animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.01]">
          {children}
        </div>

        {/* Optional Footer */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} EcoTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
