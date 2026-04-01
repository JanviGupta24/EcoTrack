import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Calendar, Clock, CheckCircle,
  AlertCircle, Trash2, Eye, X, Inbox
} from 'lucide-react';
import { wasteService } from '../api/services';
import AppLoader from '../components/Loader'; // Loader component

// Animated wrapper
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// Report detail modal
const ReportDetailModal = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {report.wasteType} Waste - {report.quantity}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Images */}
          <div className="grid grid-cols-3 gap-4">
            {report.images?.length > 0 ? (
              report.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Report ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              ))
            ) : (
              <p className="col-span-3 text-gray-500">No images submitted.</p>
            )}
          </div>

          {/* Map & Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-blue-500" />
              {/* Replace with a real map component if available */}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
              <p className="flex items-center text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" /> {report.location?.address || 'No address'}
              </p>
              <p className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" /> {new Date(report.createdAt).toLocaleString()}
              </p>
              <p className="flex items-center text-gray-700 dark:text-gray-300">
                <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" /> <span className="capitalize">{report.quantity}</span> quantity
              </p>

              {report.assignedTo && (
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" /> Assigned to: {report.assignedTo.name}
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Report Timeline</h3>
            <div className="space-y-4">
              {report.timeline?.length > 0 ? (
                report.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{item.status}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                      {item.note && <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{item.note}"</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No timeline entries.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Reports component
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters & pagination
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Status config
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock, label: 'Pending' },
    assigned: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: AlertCircle, label: 'Assigned' },
    'in-progress': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: AlertCircle, label: 'In Progress' },
    collected: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle, label: 'Collected' },
    processed: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: CheckCircle, label: 'Processed' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: X, label: 'Cancelled' }
  };

  const filters = [
    { key: 'all', label: 'All Reports' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'collected', label: 'Collected' }
  ];

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status: activeFilter === 'all' ? undefined : activeFilter,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 9
      };
      const response = await wasteService.getReports(params);
      setReports(response.data.reports || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalReports(response.data.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchTerm, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Delete handler (only for pending)
  const handleDelete = async (e, reportId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this pending report?")) {
      return;
    }

    try {
      await wasteService.deleteReport(reportId);
      // Optimistic UI update: remove from local list
      setReports(prev => prev.filter(r => r._id !== reportId));
      setTotalReports(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete report');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedBlock delay={0} className="mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all your waste reports and their status
          </p>
        </AnimatedBlock>

        {error && (
          <AnimatedBlock delay={100} className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          </AnimatedBlock>
        )}

        {/* Search & Filter */}
        <AnimatedBlock delay={200} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mt-6">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setActiveFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === filter.key
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </AnimatedBlock>

        {/* Loading / Empty / List */}
        {loading ? (
          <div className="text-center py-12">
            <AppLoader />
          </div>
        ) : reports.length === 0 ? (
          <AnimatedBlock delay={300} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Reports Found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or submit a new report.</p>
          </AnimatedBlock>
        ) : (
          <AnimatedBlock delay={300} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const statusConfigEntry = statusConfig[report.status] || statusConfig.pending;
              const StatusIcon = statusConfigEntry.icon;
              return (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={report.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&h=200&fit=crop'}
                      alt={report.wasteType}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfigEntry.color} backdrop-blur-sm`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfigEntry.label}
                      </span>
                    </div>

                    {/* Delete for pending */}
                    {report.status === 'pending' && (
                      <button
                        onClick={(e) => handleDelete(e, report._id)}
                        className="absolute top-3 left-3 bg-red-600 text-white p-2 rounded-full transform transition-all hover:scale-110 hover:bg-red-700"
                        title="Delete this report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 capitalize">
                          {report.wasteType} Waste
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{report.location?.address || 'No address'}</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-bold">
                        +{report.ecoPointsAwarded ?? 0}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 capitalize">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Quantity: {report.quantity}
                      </div>
                      {report.assignedTo && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Assigned to: {report.assignedTo.name}
                        </div>
                      )}
                    </div>

                    <button
                      className="w-full py-2 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition font-semibold flex items-center justify-center"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </AnimatedBlock>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedBlock delay={400} className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </AnimatedBlock>
        )}
      </div>

      {/* Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

export default Reports;
