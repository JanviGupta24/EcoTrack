// src/pages/AdminDashboard.jsx
/* =============================================================================
 * Admin Dashboard Page
 * =============================================================================
 * Purpose:
 *   Provide super-admin UI for managing platform data:
 *   - Overview analytics (users, reports, facilities, revenue)
 *   - User role management
 *   - Facility management
 *   - Aggregated analytics and data export
 *   - AI assistant modal (when Gemini is configured)
 *
 Data:
 *   Uses `adminService` / `wasteService` / `aiService` from `src/api/services`.
 * ============================================================================= */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Trash2, MapPin, DollarSign, Download, Search, 
  MessageSquare, Send, X, AlertCircle, Edit, Save, Loader2, Plus,
  Factory
} from 'lucide-react';
import { adminService, aiService, wasteService } from '../api/services';
import AppLoader from '../components/Loader'; // Use AppLoader to avoid icon conflict
import { useAuth } from '../context/AuthContext'; // Import useAuth to get current admin user
import { getApiErrorMessage } from "../utils/errors";

// We assume the keyframes 'animate-slideInUp' are defined globally 
// in App.js or index.css, as established in previous files.

// --- 1. Modern Animation Wrapper ---
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div 
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// --- 2. Reusable StatCard (Refactored) ---
// - Removed 'change' prop as it's not provided by the API
// - Added responsive and hover transitions
const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// --- 3. AI Assistant (Modernized) ---
const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi Admin! I can help you analyze data and generate insights. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.generateInsights({
        analysisType: 'admin dashboard query',
        data: input
      });
      setMessages([...newMessages, { role: 'assistant', content: response.data.insights }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: getApiErrorMessage(
            error,
            "Sorry — I couldn’t process that request right now. Please try again."
          ),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-white mr-3" />
            <div>
              <h3 className="font-bold text-white">AI Admin Assistant</h3>
              <p className="text-xs text-purple-100">Powered by EcoTrack AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {/* Modern typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Ask for insights... (e.g., 'Show me waste trends for plastic')"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. NEW Professional User Edit Modal ---
const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [isSaving, setIsSaving] = useState(false);
  const { user: adminUser } = useAuth(); // Get the current admin

  useEffect(() => {
    if (user) {
      setNewRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(user._id, newRole);
    setIsSaving(false);
  };

  // Prevent admin from editing their own role or a super_admin's role
  const canEdit = adminUser.role === 'super_admin' && user._id !== adminUser._id;
  const isSelf = user._id === adminUser._id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User Role</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              id="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              // Only super_admin can edit roles
              disabled={!canEdit || isSaving}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="user">User</option>
              <option value="green_champion">Green Champion</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {isSelf && <p className="text-xs text-yellow-500 mt-1">You cannot edit your own role.</p>}
            {user.role === 'super_admin' && !isSelf && <p className="text-xs text-yellow-500 mt-1">Cannot edit a Super Admin.</p>}
          </div>
        </div>
        <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canEdit || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


// --- 5. Main AdminDashboard Component ---
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAI, setShowAI] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true); // For main stats
  const [tabLoading, setTabLoading] = useState(false); // For tab content
  const [error, setError] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState('');
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'collection-center',
    capacity: 1000,
    city: '',
    lng: '',
    lat: '',
    acceptedWasteTypes: ['plastic', 'paper'],
  });
  const [facilitySaving, setFacilitySaving] = useState(false);

  const [pendingForAssign, setPendingForAssign] = useState([]);
  const [workersForAssign, setWorkersForAssign] = useState([]);
  const [assigningReportId, setAssigningReportId] = useState(null);
  const [workerChoice, setWorkerChoice] = useState({});

  const handleExport = async (type, format) => {
    try {
      const res = await adminService.exportData({ type, format });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Export failed: ${getApiErrorMessage(e, "Please try again.")}`);
    }
  };

  // Fetch overview stats on mount
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getDashboardStats();
        setStats(response.data.stats);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load dashboard stats. Please try again."));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview' || !stats) return;
    let cancelled = false;
    (async () => {
      try {
        const [repRes, workerRes] = await Promise.all([
          wasteService.getReports({ status: 'pending', limit: 25 }),
          adminService.getUsers({ role: 'worker', limit: 100 }),
        ]);
        if (cancelled) return;
        setPendingForAssign(repRes.data.reports || []);
        setWorkersForAssign(workerRes.data.users || []);
      } catch {
        if (!cancelled) {
          setPendingForAssign([]);
          setWorkersForAssign([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, stats]);

  const handleAssignReport = async (reportId) => {
    const workerId = workerChoice[reportId];
    if (!workerId) {
      alert('Select a worker first.');
      return;
    }
    setAssigningReportId(reportId);
    try {
      await adminService.assignReport({ reportId, workerId });
      setPendingForAssign((prev) => prev.filter((r) => r._id !== reportId));
      setWorkerChoice((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Assignment failed. Please try again."));
    } finally {
      setAssigningReportId(null);
    }
  };

  // Fetch data when tabs change
  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'overview') return; // Overview data is already loaded
      
      setTabLoading(true);
      setError(null);
      try {
        if (activeTab === 'users') {
          const res = await adminService.getUsers();
          setUsers(res.data.users);
        } else if (activeTab === 'facilities') {
          const res = await adminService.getFacilities();
          setFacilities(res.data.facilities);
        } else if (activeTab === 'analytics') {
          const res = await adminService.getAnalytics();
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, `Failed to load ${activeTab}. Please try again.`));
      } finally {
        setTabLoading(false);
      }
    };
    
    fetchTabData();
  }, [activeTab]);
  
  // --- Modal Handlers ---
  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (userId, role) => {
    try {
      const response = await adminService.updateUserRole(userId, { role });
      // Update local state instantly for a modern UX
      setUsers(users.map(u => u._id === userId ? response.data.user : u));
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      alert(`Failed to update role: ${getApiErrorMessage(err, "Please try again.")}`);
    }
  };

  if (loading && !stats) {
    return <AppLoader />;
  }
  
  // Format data for charts
  const wasteDistChartData = stats?.wasteTypeDistribution.map(item => ({
    name: item._id || 'unknown',
    value: item.count
  })) || [];

  const monthlyChartData = stats?.monthlyReports.map(item => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    reports: item.count
  })).reverse() || [];

  const q = userFilter.trim().toLowerCase();
  const filteredUsers = !q
    ? users
    : users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );

  const submitFacility = async (e) => {
    e.preventDefault();
    const lng = parseFloat(facilityForm.lng);
    const lat = parseFloat(facilityForm.lat);
    if (!facilityForm.name || Number.isNaN(lng) || Number.isNaN(lat)) {
      alert('Name and valid longitude/latitude are required.');
      return;
    }
    setFacilitySaving(true);
    try {
      await adminService.createFacility({
        name: facilityForm.name,
        type: facilityForm.type,
        capacity: Number(facilityForm.capacity) || 0,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
          city: facilityForm.city || undefined,
        },
        acceptedWasteTypes: facilityForm.acceptedWasteTypes,
      });
      setShowFacilityForm(false);
      setFacilityForm({
        name: '',
        type: 'collection-center',
        capacity: 1000,
        city: '',
        lng: '',
        lat: '',
        acceptedWasteTypes: ['plastic', 'paper'],
      });
      const res = await adminService.getFacilities();
      setFacilities(res.data.facilities);
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not create facility. Please try again."));
    } finally {
      setFacilitySaving(false);
    }
  };

  const removeFacility = async (id) => {
    if (!window.confirm('Delete this facility?')) return;
    try {
      await adminService.deleteFacility(id);
      setFacilities((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed. Please try again."));
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12">
      {/* Header */}
      <AnimatedBlock delay={0}>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-purple-100">Operations, users, and facilities</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport('users', 'csv')}
                  className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Users CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('reports', 'csv')}
                  className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Reports CSV
                </button>
                <button
                  onClick={() => setShowAI(true)}
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition flex items-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedBlock>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 pb-12">
        {/* Stat Cards (Animated & Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && (
            <>
              <AnimatedBlock delay={100}>
                <StatCard
                  icon={Users}
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  color="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
              </AnimatedBlock>
              <AnimatedBlock delay={200}>
                <StatCard
                  icon={Trash2}
                  title="Total Reports"
                  value={stats.totalReports.toLocaleString()}
                  subtitle={`${stats.pendingReports || 0} pending`}
                  color="bg-gradient-to-br from-green-500 to-emerald-500"
                />
              </AnimatedBlock>
              <AnimatedBlock delay={300}>
                <StatCard
                  icon={MapPin}
                  title="Facilities"
                  value={stats.totalFacilities || 0}
                  subtitle="All operational"
                  color="bg-gradient-to-br from-orange-500 to-red-500"
                />
              </AnimatedBlock>
              <AnimatedBlock delay={400}>
                <StatCard
                  icon={DollarSign}
                  title="Revenue"
                  value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
                  subtitle="This month"
                  color="bg-gradient-to-br from-purple-500 to-pink-500"
                />
              </AnimatedBlock>
            </>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <AnimatedBlock delay={500}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {['overview', 'users', 'facilities', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold capitalize transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 min-h-[400px]">
              {tabLoading ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 mr-2 self-center">Export data:</span>
                        <button type="button" onClick={() => handleExport('users', 'json')} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Users JSON</button>
                        <button type="button" onClick={() => handleExport('facilities', 'csv')} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Facilities CSV</button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Reports</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb dark:stroke-gray-700" />
                              <XAxis dataKey="month" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                              <Legend />
                              <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Waste Distribution</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={wasteDistChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={(entry) => `${entry.name} ${entry.value}`}>
                                {wasteDistChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'][index % 5]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {pendingForAssign.length > 0 && (
                        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-900/20 p-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Assign pending reports ({pendingForAssign.length})
                          </h3>
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {pendingForAssign.map((r) => (
                              <div
                                key={r._id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                                    {r.wasteType} · {r.quantity}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {r.location?.address || 'Location on file'} ·{' '}
                                    {r.reporterId?.name || 'Reporter'}
                                  </p>
                                </div>
                                <select
                                  value={workerChoice[r._id] || ''}
                                  onChange={(e) =>
                                    setWorkerChoice((prev) => ({
                                      ...prev,
                                      [r._id]: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[180px]"
                                >
                                  <option value="">Select worker…</option>
                                  {workersForAssign.map((w) => (
                                    <option key={w._id} value={w._id}>
                                      {w.name} ({w.email})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  disabled={assigningReportId === r._id || !workersForAssign.length}
                                  onClick={() => handleAssignReport(r._id)}
                                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                                >
                                  {assigningReportId === r._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin inline" />
                                  ) : (
                                    'Assign'
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          {!workersForAssign.length ? (
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-3">
                              No worker accounts found. Create users with role &quot;worker&quot; first (seed or super admin).
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Users Tab (Now Interactive) */}
                  {activeTab === 'users' && (
                    <div>
                      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="search"
                            placeholder="Filter by name or email..."
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {filteredUsers.length} of {users.length} shown
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reports</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{user.name}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'worker' ? 'bg-blue-100 text-blue-700' : user.role === 'admin' ? 'bg-orange-100 text-orange-700' : user.role === 'super_admin' ? 'bg-red-100 text-red-700' : user.role === 'green_champion' ? 'bg-emerald-100 text-emerald-800' : 'bg-green-100 text-green-700'}`}>{user.role}</span></td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-white">{user.reportsCount || 0}</td>
                                <td className="px-4 py-3">
                                  <button onClick={() => openUserModal(user)} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Facilities Tab */}
                  {activeTab === 'facilities' && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Factory className="w-5 h-5" /> Facilities
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowFacilityForm(!showFacilityForm)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          <Plus className="w-4 h-4" /> Add facility
                        </button>
                      </div>

                      {showFacilityForm && (
                        <form onSubmit={submitFacility} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <input required placeholder="Facility name" value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                            <select value={facilityForm.type} onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                              <option value="collection-center">Collection center</option>
                              <option value="recycling-plant">Recycling plant</option>
                              <option value="composting-unit">Composting unit</option>
                              <option value="disposal-site">Disposal site</option>
                              <option value="sorting-station">Sorting station</option>
                              <option value="material-recovery-facility">MRF</option>
                            </select>
                            <input type="number" placeholder="Capacity (kg)" value={facilityForm.capacity} onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                            <input placeholder="City (optional)" value={facilityForm.city} onChange={(e) => setFacilityForm({ ...facilityForm, city: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                            <input required placeholder="Longitude" value={facilityForm.lng} onChange={(e) => setFacilityForm({ ...facilityForm, lng: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                            <input required placeholder="Latitude" value={facilityForm.lat} onChange={(e) => setFacilityForm({ ...facilityForm, lat: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                          </div>
                          <p className="text-xs text-gray-500">Accepted types default to plastic &amp; paper. Adjust in API/DB if needed.</p>
                          <button type="submit" disabled={facilitySaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                            {facilitySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save facility
                          </button>
                        </form>
                      )}

                      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">City</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Load</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {facilities.length === 0 ? (
                              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No facilities yet. Add one above.</td></tr>
                            ) : (
                              facilities.map((f) => (
                                <tr key={f._id} className="border-t border-gray-200 dark:border-gray-700">
                                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{f.name}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.type}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.location?.city || '—'}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.currentLoad || 0} / {f.capacity}</td>
                                  <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600">{f.status}</span></td>
                                  <td className="px-4 py-3">
                                    <button type="button" onClick={() => removeFacility(f._id)} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'analytics' && analytics && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reports by status</h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={(analytics.statusBreakdown || []).map((s) => ({ name: s._id, count: s.count }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Top reporters</h3>
                          <ul className="space-y-2 text-sm">
                            {(analytics.topReporters || []).map((r) => (
                              <li key={r._id} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-900 dark:text-white font-medium">{r.name}</span>
                                <span className="text-blue-600 font-semibold">{r.reportCount} reports</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">By city</h3>
                          <ul className="space-y-2 text-sm">
                            {(analytics.cityWise || []).map((c) => (
                              <li key={c._id} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-900 dark:text-white">{c._id}</span>
                                <span className="text-gray-600 dark:text-gray-400">{c.count} reports</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Worker assignment load</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-2 text-left">Worker</th>
                                <th className="px-4 py-2 text-left">Assigned reports</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(analytics.workerLoads || []).map((w) => (
                                <tr key={w._id} className="border-t border-gray-200 dark:border-gray-700">
                                  <td className="px-4 py-2 text-gray-900 dark:text-white">{w.name}</td>
                                  <td className="px-4 py-2">{w.assigned}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'analytics' && !analytics && !tabLoading && (
                    <p className="text-gray-500 text-center py-12">No analytics data.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </AnimatedBlock>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />
      
      {/* User Edit Modal */}
      <UserEditModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </div>
  );
};

export default AdminDashboard;