/* =============================================================================
 * Worker Dashboard Page
 * =============================================================================
 * Purpose:
 *   Provide workers with:
 *   - Assigned reports by status (assigned/in-progress/collected)
 *   - Actions to update report status with timeline + notifications
 *   - Performance stats and daily schedule view
 *
 Data:
 *   - `workerService.getWorkStats()`
 *   - `workerService.getAssignedReports({status})`
 *   - `workerService.updateReportStatus()`
 * ============================================================================= */

import React, { useState, useEffect } from 'react';
import {
  Truck, CheckCircle, Clock, MapPin, Phone, User,
  Calendar, Star, AlertCircle, Loader
} from 'lucide-react';
import { workerService } from '../api/services';
import AppLoader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from "../utils/errors";

// Animation wrapper
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// Reusable StatCard
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div
    className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300`}
  >
    <Icon className="w-8 h-8 mb-3" />
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-90">{title}</div>
  </div>
);

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Fetch stats
  const fetchData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);
      setError(null);
      const statsRes = await workerService.getWorkStats();
      setStats(statsRes.data?.stats || {});
    } catch (err) {
      console.error("Failed to fetch worker stats:", err);
      setError(getApiErrorMessage(err, "Failed to load stats. Please try again."));
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    setTabLoading(true);
    try {
      const reportsRes = await workerService.getAssignedReports({ status: activeTab });
      setReports(reportsRes.data?.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError(getApiErrorMessage(err, "Failed to load reports. Please try again."));
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  // Update report status
  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading(reportId);
    try {
      await workerService.updateReportStatus(reportId, { status: newStatus });
      await Promise.all([fetchData(), fetchReports()]);
    } catch (err) {
      console.error("Failed to update report status:", err);
      setError(getApiErrorMessage(err, "Failed to update status. Please try again."));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <AppLoader />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedBlock delay={0} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name?.split(' ')[0] || 'Worker'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here are your assignments for today.
          </p>
        </AnimatedBlock>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedBlock delay={100}>
            <StatCard
              icon={CheckCircle}
              title="Today's Collections"
              value={stats?.todayCollections ?? 0}
              color="from-green-500 to-emerald-600"
            />
          </AnimatedBlock>
          <AnimatedBlock delay={200}>
            <StatCard
              icon={Clock}
              title="Pending Assignments"
              value={stats?.pending ?? 0}
              color="from-blue-500 to-cyan-600"
            />
          </AnimatedBlock>
          <AnimatedBlock delay={300}>
            <StatCard
              icon={Truck}
              title="Total Completed (All Time)"
              value={stats?.totalCompleted ?? 0}
              color="from-purple-500 to-pink-600"
            />
          </AnimatedBlock>
          <AnimatedBlock delay={400}>
            <StatCard
              icon={Star}
              title="Your Average Rating"
              value={stats?.avgRating != null ? String(stats.avgRating) : '0.0'}
              color="from-orange-500 to-red-600"
            />
          </AnimatedBlock>
        </div>

        {/* Tabs */}
        <AnimatedBlock delay={500}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { key: 'assigned', label: 'Assigned', count: stats?.pending },
                { key: 'in-progress', label: 'In Progress', count: stats?.inProgress },
                { key: 'collected', label: 'Collected', count: stats?.totalCompleted },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {label} ({count ?? 0})
                </button>
              ))}
            </div>
          </div>
        </AnimatedBlock>

        {/* Reports */}
        <AnimatedBlock delay={600} className="space-y-4">
          {tabLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                All clear!
              </h3>
              <p>No reports found in this category.</p>
            </div>
          ) : (
            reports.map((report) => {
              const isLoading = actionLoading === report._id;
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${report?.location?.coordinates?.[1]},${report?.location?.coordinates?.[0]}`;

              return (
                <div
                  key={report._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          report.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                        }`}
                      >
                        <Truck
                          className={`w-6 h-6 ${
                            report.priority === 'high'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 capitalize">
                          {report.wasteType} Waste - {report.quantity}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {report?.location?.address || 'No address'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4 mr-2" />
                            {report?.reporterId?.name || 'Unknown'}
                          </div>
                          <a
                            href={`tel:${report?.reporterId?.phone || ''}`}
                            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {report?.reporterId?.phone || 'N/A'}
                          </a>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            Assigned:{" "}
                            {report.assignedAt
                              ? new Date(report.assignedAt).toLocaleString()
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          report.status === 'assigned'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : report.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}
                      >
                        {report.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {report.status === 'assigned' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'in-progress')}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                        >
                          {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            'Start Collection'
                          )}
                        </button>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none text-center px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          View Map
                        </a>
                      </>
                    ) : report.status === 'in-progress' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'collected')}
                          disabled={isLoading}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            'Mark as Collected'
                          )}
                        </button>
                        <button
                          disabled
                          title="Photo upload requires a separate endpoint"
                          className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition disabled:opacity-50"
                        >
                          Upload Photo
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This report has been {report.status}.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default WorkerDashboard;
