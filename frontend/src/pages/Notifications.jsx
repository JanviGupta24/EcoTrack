import React, { useEffect, useState } from "react";
import { Bell, Loader, CheckCircle, Trash2, ArrowLeft } from "lucide-react";
import { notificationService } from "../api/services";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getNotifications({ limit: 50 });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark All as Read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // ✅ Delete a Notification
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-105 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-7 h-7 mr-2 text-blue-500" /> Notifications
          </h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-md transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 py-6 rounded-lg font-medium">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Bell className="w-12 h-12 mb-3 text-blue-400" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm">
            You’ll see updates and alerts here once available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-xl shadow-md border transition-all hover:shadow-lg ${
                notif.isRead
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {notif.title || "Notification"}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notif.isRead && (
                    <CheckCircle
                      className="w-5 h-5 text-green-500"
                      title="Unread"
                    />
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
