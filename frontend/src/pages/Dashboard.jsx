// src/pages/Dashboard.jsx
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
  Recycle,
  Trash2,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { userService, wasteService } from "../api/services";
import Loader from "../components/Loader";

const AnimatedBlock = ({ children, delay = 0 }) => (
  <div className="animate-slideInUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

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

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsResponse = await userService.getStats();
        setStats(statsResponse.data.stats);

        const reportsResponse = await wasteService.getReports({
          limit: 3,
          sortBy: "-createdAt",
        });
        setRecentReports(reportsResponse.data.reports);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError(
          err.response?.data?.message || "Could not load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  const wasteDistribution = stats?.wasteDistribution || [];

  const getStatusStyle = (status) => {
    switch (status) {
      case "collected":
        return "bg-green-100 text-green-700";
      case "processed":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "assigned":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors pb-12">
      {/* Header */}
      <AnimatedBlock>
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-blue-100">
                Let's make the planet greener together
              </p>
            </div>

            {/* ✅ Avatar updated with initials fallback */}
            <img
              src={
                user?.avatar
                  ? user.avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=10b981&color=fff`
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
            />
          </div>
        </div>
      </AnimatedBlock>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8">
        {/* Stats */}
        <AnimatedBlock delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Award}
              title="Eco Points"
              value={stats?.totalEcoPoints || 0}
              color="bg-gradient-to-br from-yellow-400 to-orange-500"
            />
            <StatCard
              icon={Recycle}
              title="Reports Submitted"
              value={stats?.totalReports || 0}
              color="bg-gradient-to-br from-green-400 to-emerald-500"
            />
            <StatCard
              icon={Trash2}
              title="Waste Collected"
              value={`${stats?.totalWasteKg || 0} kg`}
              color="bg-gradient-to-br from-blue-400 to-cyan-500"
            />
            <StatCard
              icon={Users}
              title="Community Rank"
              value={`#${stats?.rank || "N/A"}`}
              color="bg-gradient-to-br from-purple-400 to-pink-500"
            />
          </div>
        </AnimatedBlock>

        {/* Charts */}
        <AnimatedBlock delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Monthly Activity
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats?.monthlyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold flex items-center mb-4">
                <Recycle className="w-5 h-5 mr-2 text-green-500" />
                Your Waste Distribution
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
                    label={(entry) => `${entry.name}: ${entry.value}kg`}
                  >
                    {wasteDistribution.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#6366f1",
                            "#8b5cf6",
                          ][i % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AnimatedBlock>

        {/* Recent Reports */}
        <AnimatedBlock delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Recent Reports
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Points</th>
                  </tr>
                </thead>

                <tbody>
                  {recentReports.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        No reports yet.
                      </td>
                    </tr>
                  ) : (
                    recentReports.map((r) => (
                      <tr key={r._id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 capitalize">{r.wasteType}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                              r.status
                            )}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-green-600 font-bold">
                          +{r.ecoPointsAwarded}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default Dashboard;
