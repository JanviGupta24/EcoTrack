/* =============================================================================
 * PublicLayout Component
 * =============================================================================
 * Purpose:
 *   Provide the application shell for public pages (unauthenticated):
 *   - Renders `PublicNavbar`
 *   - Provides an `<Outlet />` for nested route components
 *   - Renders `Footer` below the outlet content
 * ============================================================================= */
import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* 🌿 Public Navbar (for landing, about, contact, etc.) */}
      <PublicNavbar />

      {/* 🌍 Main Page Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* ✅ Footer — ensures no gap above */}
      <div className="-mt-px">
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
