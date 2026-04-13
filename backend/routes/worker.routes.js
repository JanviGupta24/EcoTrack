/* =============================================================================
 * Worker Routes
 * =============================================================================
 * Purpose:
 *   Expose authenticated worker operations for assigned waste reports:
 *   - List assigned reports (with optional status filter)
 *   - Update report status (timeline + notifications handled in controller)
 *   - View worker stats and daily schedule
 *
 * Security:
 *   All routes require authentication and role authorization via
 *   `authorize('worker','super_admin')` middleware.
 * ============================================================================= */
const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Middleware: Authenticate user and ensure worker access
 */
router.use(authenticate, authorize('worker', 'super_admin'));

/**
 * @route   GET /api/worker/assigned-reports
 * @desc    Fetch all waste reports assigned to the logged-in worker
 * @query   ?status=pending|in-progress|collected&page=1&limit=20
 * @access  Private (Worker only)
 */
router.get('/assigned-reports', workerController.getAssignedReports);

/**
 * @route   PATCH /api/worker/reports/:id/status
 * @desc    Update the status of a report (in-progress / collected)
 * @body    { status: string, note?: string, verificationPhoto?: string }
 * @access  Private (Worker only)
 */
router.patch('/reports/:id/status', workerController.updateReportStatus);

/**
 * @route   GET /api/worker/stats
 * @desc    Get worker performance stats (completed tasks, ratings, etc.)
 * @access  Private (Worker only)
 */
router.get('/stats', workerController.getWorkStats);

/**
 * @route   GET /api/worker/schedule
 * @desc    Get worker’s schedule for a given date (default: today)
 * @query   ?date=YYYY-MM-DD
 * @access  Private (Worker only)
 */
router.get('/schedule', workerController.getSchedule);

module.exports = router;
