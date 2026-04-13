/* =============================================================================
 * Champion Dashboard Page
 * =============================================================================
 * Purpose:
 *   Provide a `green_champion` user experience:
 *   - community-focused overview dashboard
 *   - engagement metrics and navigation
 *
 Data:
 *   Uses `championService.getDashboard()` via the shared API layer.
 * ============================================================================= */

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  TrendingUp,
  Recycle,
  Users,
  MapPin,
  Calendar,
  Globe,
  Heart,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { championService } from "../../api/services"; // ✅ Use Champion Service
import Loader from "../../components/Loader";
import { getApiErrorMessage } from "../../utils/errors";

// 🌿 Animation Wrapper
const AnimatedBlock = ({ children, delay = 0 }) => (
  <div className="animate-slideInUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

// 🌿 Stat Card Component
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

// Mock charts (static visualization)
const impactData = [
  { month: "Jan", reports: 20 },
  { month: "Feb", reports: 45 },
  { month: "Mar", reports: 35 },
  { month: "Apr", reports: 55 },
  { month: "May", reports: 80 },
  { month: "Jun", reports: 60 },
];

const wasteDistribution = [
  { name: "Plastic", value: 40, color: "#3b82f6" },
  { name: "Organic", value: 30, color: "#10b981" },
  { name: "E-waste", value: 15, color: "#f59e0b" },
  { name: "Metal", value: 10, color: "#6366f1" },
  { name: "Glass", value: 5, color: "#8b5cf6" },
];

const ChampionDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [communityReports, setCommunityReports] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                            🔄 Fetch Dashboard Data                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchChampionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsResponse = await championService.getDashboard();
        const reportsResponse = await championService.getReports({ limit: 5 });
        const eventsResponse = await championService.getEvents();

        setStats(statsResponse.data.stats);
        setCommunityReports(reportsResponse.data.reports || []);
        setUpcomingEvents(eventsResponse.data.events || []);
      } catch (err) {
        console.error("Error loading Champion Dashboard:", err);
        setError(getApiErrorMessage(err, "Could not load dashboard data. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchChampionData();
  }, [user]);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <span>{error}</span>
        </div>
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /*                                🌿 Dashboard UI                             */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors pb-12">
      {/* Header */}
      <AnimatedBlock delay={0}>
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-12 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                Welcome, {user?.name}! 🌎
              </h1>
              <p className="text-blue-100">
                Your community depends on your eco-leadership.
              </p>
            </div>
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`
              }
              alt="Champion Avatar"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
            />
          </div>
        </div>
      </AnimatedBlock>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8">
        {/* Stats Section */}
        <AnimatedBlock delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Community Members"
              value={stats?.communityMembers || 0}
              color="bg-gradient-to-br from-blue-400 to-indigo-500"
            />
            <StatCard
              icon={Recycle}
              title="Reports Supervised"
              value={stats?.reportsHandled || 0}
              color="bg-gradient-to-br from-green-400 to-emerald-500"
            />
            <StatCard
              icon={Award}
              title="Impact Points"
              value={stats?.impactPoints || 0}
              color="bg-gradient-to-br from-yellow-400 to-orange-500"
            />
            <StatCard
              icon={Globe}
              title="Area Covered"
              value={`${stats?.coverageKm || 0} km²`}
              color="bg-gradient-to-br from-teal-400 to-cyan-500"
            />
          </div>
        </AnimatedBlock>

        {/* Charts */}
        <AnimatedBlock delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Monthly Community Impact
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Recycle className="w-5 h-5 mr-2 text-blue-500" />
                Community Waste Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={wasteDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.name} ${entry.value}%`}
                  >
                    {wasteDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AnimatedBlock>

        {/* Community Reports */}
        <AnimatedBlock delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Latest Community Reports
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {communityReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        No community reports available.
                      </td>
                    </tr>
                  ) : (
                    communityReports.map((r) => (
                      <tr
                        key={r._id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="py-4 px-4 text-gray-900 dark:text-white">
                          {typeof r.location === "object"
                            ? r.location.address ||
                              `(${r.location.coordinates?.[1]?.toFixed(2)}, ${r.location.coordinates?.[0]?.toFixed(2)})`
                            : r.location || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {r.wasteType || "Unknown"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              r.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedBlock>

        {/* Upcoming Events */}
        <AnimatedBlock delay={400}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Upcoming Green Events
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                No upcoming events.
              </p>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((e) => (
                  <li
                    key={e._id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {e.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {e.location} • {new Date(e.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Heart className="w-6 h-6 text-red-400" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default ChampionDashboard;
