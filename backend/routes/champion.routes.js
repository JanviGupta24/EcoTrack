/* =============================================================================
 * Champion Routes (Green Champion Role)
 * =============================================================================
 * Purpose:
 *   Provide community-facing endpoints for users with `green_champion` role:
 *   - GET `/api/champion/dashboard`
 *   - GET `/api/champion/reports`
 *   - GET `/api/champion/events`
 *   - GET `/api/champion/resources`
 *
 * Security:
 *   All routes are protected by:
 *   - `authenticate` (JWT required)
 *   - `protectChampion` (role check)
 * ============================================================================= */
const express = require("express");
const router = express.Router();
const { authenticate, protectChampion } = require("../middleware/auth.middleware");
const {
  getDashboard,
  getReports,
  getEvents,
  getResources,
} = require("../controllers/champion.controller");

// 🟢 All routes require authentication and Champion role
router.use(authenticate, protectChampion);

// 🌿 Dashboard Data
router.get("/dashboard", getDashboard);

// 📋 Community Reports
router.get("/reports", getReports);

// 📅 Upcoming Events
router.get("/events", getEvents);

// 📚 Learning Resources
router.get("/resources", getResources);

module.exports = router;
