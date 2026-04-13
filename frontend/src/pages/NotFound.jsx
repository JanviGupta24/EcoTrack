/* =============================================================================
 * Not Found Page
 * =============================================================================
 * Purpose:
 *   Provide a friendly 404 UI for unmatched routes.
 * ============================================================================= */
import React from 'react';
import { Home, Compass } from 'lucide-react'; // Changed Search to Compass for a "lost" theme
import { useNavigate } from 'react-router-dom';

// --- 1. NEW Animation Styles ---
// We define these locally to keep this component self-contained.
const AnimationStyles = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    @keyframes slideInUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slideInUp {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
    }
  `}</style>
);

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 overflow-hidden">
      <AnimationStyles />
      <div className="text-center">
        
        {/* 2. Animated 404 Text */}
        <div className="mb-8 animate-float">
          <div className="text-9xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            404
          </div>
        </div>
        
        {/* 3. Staggered Animation Content */}
        <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInUp" 
          style={{ animationDelay: '200ms' }}
        >
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)} // This correctly goes back one page
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
        
        <div 
          className="mt-12 animate-slideInUp" 
          style={{ animationDelay: '300ms' }}
        >
          <Compass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Let's get you back on track.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;