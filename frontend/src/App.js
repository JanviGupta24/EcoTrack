/* =============================================================================
 * Frontend App Router
 * =============================================================================
 * Purpose:
 *   Configure React Router routes for all public and authenticated screens in
 *   the EcoTrack frontend.
 *
 * Key Responsibilities:
 *   - Wrap the app with Theme + Auth providers and Google OAuth provider.
 *   - Define route guards for role-based access:
 *     - Worker: `/app/worker`
 *     - Admin/Super Admin: `/app/admin`
 *     - Green Champion: `/app/champion`
 *   - Lazy-load pages to improve initial load performance.
 *
 External Dependencies:
 *   - `react-router-dom` (routing + guards)
 *   - `@react-oauth/google` (Google OAuth provider)
 * ============================================================================= */
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Components
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import Loader from "./components/Loader";

// Layouts
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));

// Pages (Lazy Loaded)
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyResetOTP = lazy(() => import("./pages/VerifyResetOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const WasteReport = lazy(() => import("./pages/WasteReport"));
const Reports = lazy(() => import("./pages/Reports"));
const Training = lazy(() => import("./pages/Training"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Champion Pages
const ChampionDashboard = lazy(
  () => import("./pages/champion/ChampionDashboard")
);
const ChampionReports = lazy(() => import("./pages/champion/ChampionReports"));
const ChampionEvents = lazy(() => import("./pages/champion/ChampionEvents"));
const ChampionResources = lazy(
  () => import("./pages/champion/ChampionResources")
);

/* -------------------- Animated Wrapper -------------------- */
const AnimatedPage = ({ children }) => (
  <div className="animate-fadeIn">{children}</div>
);

/* -------------------- Authenticated Layout -------------------- */
const AppLayout = () => (
  <>
    <Navbar />
    <main className="pt-16">
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </main>
    <ChatBot />
  </>
);

/* -------------------- Route Guards -------------------- */
const ProtectedRouteWrapper = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/app/dashboard" replace />;

  return <AppLayout />;
};

const PublicOnlyRouteWrapper = ({ element }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <AnimatedPage>{element}</AnimatedPage>;
};

/* -------------------- App Root -------------------- */
function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

  const appTree = (
      <Router>
        <ThemeProvider>
          <AuthProvider>
            {/* Global Animations */}
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes slideInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
              .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; opacity: 0; }
            `}</style>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* Public Main Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicOnlyRouteWrapper element={<PublicLayout />} />
                    }
                  >
                    <Route index element={<Landing />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="terms" element={<Terms />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route
                    path="/login"
                    element={<PublicOnlyRouteWrapper element={<Login />} />}
                  />
                  <Route
                    path="/register"
                    element={<PublicOnlyRouteWrapper element={<Register />} />}
                  />

                  {/* 🔥 Password Reset Flow */}
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicOnlyRouteWrapper element={<ForgotPassword />} />
                    }
                  />
                  <Route
                    path="/verify-reset-otp"
                    element={
                      <PublicOnlyRouteWrapper element={<VerifyResetOTP />} />
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicOnlyRouteWrapper element={<ResetPassword />} />
                    }
                  />

                  {/* Protected /app routes */}
                  <Route path="/app" element={<ProtectedRouteWrapper />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="report-waste" element={<WasteReport />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="training" element={<Training />} />
                    <Route path="training/:id" element={<CourseDetail />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="wallet" element={<Wallet />} />
                    <Route path="profile" element={<Profile />} />

                    {/* Worker */}
                    <Route
                      path="worker"
                      element={
                        <ProtectedRouteWrapper allowedRoles={["worker"]} />
                      }
                    >
                      <Route index element={<WorkerDashboard />} />
                    </Route>

                    {/* Admin */}
                    <Route
                      path="admin"
                      element={
                        <ProtectedRouteWrapper
                          allowedRoles={["admin", "super_admin"]}
                        />
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                    </Route>

                    {/* Champion */}
                    <Route
                      path="champion"
                      element={
                        <ProtectedRouteWrapper
                          allowedRoles={["green_champion"]}
                        />
                      }
                    >
                      <Route index element={<ChampionDashboard />} />
                      <Route path="dashboard" element={<ChampionDashboard />} />
                      <Route path="reports" element={<ChampionReports />} />
                      <Route path="events" element={<ChampionEvents />} />
                      <Route path="resources" element={<ChampionResources />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Global 404 */}
                  <Route
                    path="*"
                    element={
                      <AnimatedPage>
                        <NotFound />
                      </AnimatedPage>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
  );

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {appTree}
      </GoogleOAuthProvider>
    );
  }

  return appTree;
}

export default App;
