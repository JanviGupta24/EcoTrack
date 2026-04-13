/* =============================================================================
 * Loader Component
 * =============================================================================
 * Purpose:
 *   Render a full-screen, branded loading indicator used during:
 *   - initial app load
 *   - auth state checks
 *   - route transitions requiring data
 *
 Props:
 *   - `text` (optional): helper message displayed under the spinner.
 * ============================================================================= */
import React from 'react';
import { Leaf } from 'lucide-react';

/**
 * @component Loader
 * A full-screen, branded loading indicator for the application.
 * Used for initial page loads and auth checks.
 *
 * @param {object} props
 * @param {string} [props.text] - Optional text to display below the loader.
 */
const Loader = ({ text }) => {
  return (
    // 1. Added accessibility roles
    <div 
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Your animations are great, no changes needed here */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
            <Leaf className="w-10 h-10 text-green-500 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Loading...
        </h2>
        {/* 2. Use the new 'text' prop with a fallback */}
        <p className="text-gray-600 dark:text-gray-400">
          {text || "Please wait while we prepare your dashboard"}
        </p>
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;