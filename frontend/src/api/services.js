/* =============================================================================
 * API Service Layer
 * =============================================================================
 * Purpose:
 *   Provide typed-by-convention client wrappers around backend endpoints.
 *   Each service object groups calls by feature:
 *   - wasteService
 *   - userService
 *   - trainingService
 *   - paymentService
 *   - aiService
 *   - notificationService
 *   - adminService
 *   - workerService
 *   - championService
 *
 Dependencies:
 *   - `api` axios instance from `frontend/src/api/axios.js`
 * ============================================================================= */

import api from "./axios";

/* ================================
   🟢 WASTE MANAGEMENT SERVICE
================================ */
export const wasteService = {
  createReport: (formData) =>
    api.post("/waste/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getReports: (params) => api.get("/waste/reports", { params }),

  getReportById: (id) => api.get(`/waste/reports/${id}`),

  updateReport: (id, data) => api.patch(`/waste/reports/${id}`, data),

  deleteReport: (id) => api.delete(`/waste/reports/${id}`),

  getNearbyFacilities: (params) =>
    api.get("/waste/nearby-facilities", { params }),

  rateCollection: (id, data) => api.post(`/waste/reports/${id}/rate`, data),

  // ⭐ Added for AI image classify endpoint
  classifyImage: (formData) =>
    api.post("/ai/classify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ================================
   🧍 USER SERVICE
================================ */
export const userService = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.patch("/users/me", data),
  uploadAvatar: (formData) =>
    api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getStats: () => api.get("/users/stats"),
  getLeaderboard: (params) => api.get("/users/leaderboard", { params }),
};

/* ================================
   🎓 TRAINING SERVICE
================================ */
export const trainingService = {
  getCourses: () => api.get("/training/courses"),
  getCourseById: (id) => api.get(`/training/courses/${id}`),
  enrollCourse: (id) => api.post(`/training/courses/${id}/enroll`),
  completeCourse: (id) => api.post(`/training/courses/${id}/complete`),
  getMyCourses: () => api.get("/training/my-courses"),
  getCertificates: () => api.get("/training/certificates"),
  getCourseProgress: (id) => api.get(`/training/courses/${id}/progress`),
  updateProgress: (id, payload) =>
    api.post(`/training/courses/${id}/progress`, payload),
};

/* ================================
   💳 PAYMENT SERVICE
================================ */
export const paymentService = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verifyPayment: (data) => api.post("/payments/verify", data),
  redeemPoints: (data) => api.post("/payments/redeem", data),
  requestWithdraw: (data) => api.post("/payments/withdraw", data),
  getTransactions: (params) => api.get("/payments/transactions", { params }),
  getWallet: () => api.get("/payments/wallet"),
};

/* ================================
   🤖 AI SERVICE
================================ */
export const aiService = {
  chatbot: (data) => api.post("/ai/chatbot", data),

  // ❗ FIXED → Matches backend route /api/ai/classify
  classifyWaste: (data) => api.post("/ai/classify", data),

  generateInsights: (data) => api.post("/ai/generate-insights", data),
  generateQuiz: (data) => api.post("/ai/generate-quiz", data),
};

/* ================================
   🔔 NOTIFICATION SERVICE
================================ */
export const notificationService = {
  getNotifications: (params) => api.get("/notifications", { params }),

  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch("/notifications/read-all"),

  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

/* ================================
   🛠️ ADMIN SERVICE
================================ */
export const adminService = {
  getDashboardStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),

  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),

  getFacilities: (params) => api.get("/admin/facilities", { params }),

  createFacility: (data) => api.post("/admin/facilities", data),

  updateFacility: (id, data) => api.patch(`/admin/facilities/${id}`, data),

  deleteFacility: (id) => api.delete(`/admin/facilities/${id}`),

  getAnalytics: (params) => api.get("/admin/analytics", { params }),

  exportData: (params) =>
    api.get("/admin/export", {
      params,
      responseType: "blob",
    }),

  assignReport: (data) => api.post("/admin/assign-report", data),
};

/* ================================
   👷 WORKER SERVICE
================================ */
export const workerService = {
  getAssignedReports: (params) =>
    api.get("/workers/assigned-reports", { params }),

  updateReportStatus: (id, data) =>
    api.patch(`/workers/reports/${id}/status`, data),

  getWorkStats: () => api.get("/workers/stats"),
};

/* ================================
   🌿 GREEN CHAMPION SERVICE
================================ */
export const championService = {
  getDashboard: () => api.get("/champion/dashboard"),

  getReports: (params) => api.get("/champion/reports", { params }),

  getEvents: () => api.get("/champion/events"),

  getResources: () => api.get("/champion/resources"),
};
