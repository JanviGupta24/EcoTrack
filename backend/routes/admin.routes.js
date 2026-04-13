/* =============================================================================
 * Admin Routes
 * =============================================================================
 * Purpose:
 *   Expose super-admin endpoints for statistics, user/worker management,
 *   facility management, analytics, and data export.
 *
 * Security:
 *   All routes require authentication and role authorization:
 *   - `authorize('admin','super_admin')`
 *   enforced via middleware.
 *
 * Mounted under `/api/admin`.
 * ============================================================================= */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Middleware: Authenticate and restrict to admin roles
 */
router.use(authenticate, authorize('admin', 'super_admin'));

/* -------------------------------------------------------------------------- */
/*                               📊 DASHBOARD STATS                            */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/admin/stats
 * @desc    Fetch admin dashboard statistics (users, reports, revenue, etc.)
 * @access  Private (Admin/Super Admin)
 */
router.get('/stats', adminController.getDashboardStats);

/* -------------------------------------------------------------------------- */
/*                                👥 USER MANAGEMENT                           */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/admin/users
 * @desc    Get list of users with pagination, search, and role filtering
 * @access  Private (Admin/Super Admin)
 */
router.get('/users', adminController.getUsers);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role (e.g., user → worker)
 * @access  Private (Admin/Super Admin)
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user and their associated data
 * @access  Private (Admin/Super Admin)
 */
router.delete('/users/:id', adminController.deleteUser);

/* -------------------------------------------------------------------------- */
/*                              🏭 FACILITY MANAGEMENT                         */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/admin/facilities
 * @desc    Get all facilities (filter by type, status, or city)
 * @access  Private (Admin/Super Admin)
 */
router.get('/facilities', adminController.getFacilities);

/**
 * @route   POST /api/admin/facilities
 * @desc    Create a new waste facility
 * @access  Private (Admin/Super Admin)
 */
router.post('/facilities', adminController.createFacility);

/**
 * @route   PATCH /api/admin/facilities/:id
 * @desc    Update existing facility details
 * @access  Private (Admin/Super Admin)
 */
router.patch('/facilities/:id', adminController.updateFacility);

/**
 * @route   DELETE /api/admin/facilities/:id
 * @desc    Delete a facility
 * @access  Private (Admin/Super Admin)
 */
router.delete('/facilities/:id', adminController.deleteFacility);

/* -------------------------------------------------------------------------- */
/*                                 📈 ANALYTICS                                */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics on reports, top reporters, and city-wise data
 * @access  Private (Admin/Super Admin)
 */
router.get('/analytics', adminController.getAnalytics);

/* -------------------------------------------------------------------------- */
/*                                📤 DATA EXPORT                               */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/admin/export
 * @desc    Export data (users, reports, or facilities) in JSON or CSV format
 * @query   type=[users|reports|facilities] & format=[json|csv]
 * @access  Private (Admin/Super Admin)
 */
router.get('/export', adminController.exportData);

/* -------------------------------------------------------------------------- */
/*                              🚚 ASSIGN REPORTS                              */
/* -------------------------------------------------------------------------- */
/**
 * @route   POST /api/admin/assign-report
 * @desc    Assign a waste report to a worker
 * @body    { reportId, workerId }
 * @access  Private (Admin/Super Admin)
 */
router.post('/assign-report', adminController.assignReport);

module.exports = router;
