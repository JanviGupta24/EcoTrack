// routes/waste.routes.js
const express = require("express");
const router = express.Router();

const wasteController = require("../controllers/waste.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const { wasteReportValidation, validate } = require("../middleware/validation");

/* -------------------------------------------------------------------------- */
/*                           🟢 CREATE WASTE REPORT                           */
/* -------------------------------------------------------------------------- */
/**
 * @route   POST /api/waste/report
 * @desc    Create a new waste report
 * @access  Private (User, Green Champion)
 */
router.post(
  "/report",
  authenticate,
  authorize("user", "green_champion"),
  upload.array("images", 5), // MUST come before validation
  wasteReportValidation, // Validate data
  validate, // Send validation errors if any
  wasteController.createReport
);

/* -------------------------------------------------------------------------- */
/*                            📄 GET ALL REPORTS                              */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/waste/reports
 * @desc    Get all waste reports (role-specific filtering)
 * @access  Private (User, Worker, Admin)
 */
router.get("/reports", authenticate, wasteController.getReports);

/* -------------------------------------------------------------------------- */
/*                            📌 GET REPORT BY ID                             */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/waste/reports/:id
 * @desc    Get report details by ID
 * @access  Private (Any authenticated user)
 */
router.get("/reports/:id", authenticate, wasteController.getReportById);

/* -------------------------------------------------------------------------- */
/*                           ✏ UPDATE REPORT                                  */
/* -------------------------------------------------------------------------- */
/**
 * @route   PATCH /api/waste/reports/:id
 * @desc    Update report (status, assignment, verification)
 * @access  Private (Worker, Admin)
 */
router.patch(
  "/reports/:id",
  authenticate,
  authorize("worker", "admin", "super_admin"),
  wasteController.updateReport
);

/* -------------------------------------------------------------------------- */
/*                           🗑 DELETE REPORT                                  */
/* -------------------------------------------------------------------------- */
/**
 * @route   DELETE /api/waste/reports/:id
 * @desc    Delete a pending report
 * @access  Private (User, Admin)
 */
router.delete(
  "/reports/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  wasteController.deleteReport
);

/* -------------------------------------------------------------------------- */
/*                       🏭 GET NEARBY WASTE FACILITIES                       */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/waste/nearby-facilities
 * @desc    Get nearby facilities using coordinates
 * @access  Private (Any authenticated user)
 */
router.get(
  "/nearby-facilities",
  authenticate,
  wasteController.getNearbyFacilities
);

/* -------------------------------------------------------------------------- */
/*                        ⭐ RATE COLLECTION PROCESS                           */
/* -------------------------------------------------------------------------- */
/**
 * @route   POST /api/waste/reports/:id/rate
 * @desc    Rate a report after collection
 * @access  Private (User, Green Champion)
 */
router.post(
  "/reports/:id/rate",
  authenticate,
  authorize("user", "green_champion"),
  wasteController.rateCollection
);

module.exports = router;
