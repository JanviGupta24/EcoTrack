import React, { useEffect, useState } from "react";
import { MapPin, Filter, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { championService } from "../../api/services"; // ✅ use championService
import Loader from "../../components/Loader";

// 🌿 Animation Wrapper
const AnimatedBlock = ({ children, delay = 0 }) => (
  <div className="animate-slideInUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const ChampionReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch Green Champion community-level reports
        const res = await championService.getReports({ limit: 50 });
        setReports(res.data.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load community reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReports();
  }, [user]);

  // 🌿 Apply filter (case-insensitive)
  const filteredReports =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status?.toLowerCase() === filter.toLowerCase());

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg flex items-center shadow">
          <AlertCircle className="w-6 h-6 mr-3" />
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-8 min-h-screen">
      {/* Header */}
      <AnimatedBlock delay={0}>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-600 flex items-center">
            <MapPin className="w-7 h-7 mr-2 text-green-500" /> Community Reports
          </h1>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Filter className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg p-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-400"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </AnimatedBlock>

      {/* Reports Table */}
      <AnimatedBlock delay={200}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredReports.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              No reports available.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400 font-semibold">
                    Location
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400 font-semibold">
                    Waste Type
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400 font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400 font-semibold">
                    Reported On
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
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

                    <td className="py-4 px-4 text-gray-700 dark:text-gray-400 capitalize">
                      {r.wasteType || "Unknown"}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : r.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.status || "N/A"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AnimatedBlock>
    </div>
  );
};

export default ChampionReports;
