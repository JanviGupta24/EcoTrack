// routes/user.routes.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { validate } = require("../middleware/validation");

/* -------------------------------------------------------------------------- */
/*                            👤 GET USER PROFILE                              */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/users/me
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get("/me", authenticate, userController.getProfile);

/* -------------------------------------------------------------------------- */
/*                            ✏️ UPDATE PROFILE                                */
/* -------------------------------------------------------------------------- */
/**
 * @route   PATCH /api/users/me
 * @desc    Update profile fields (name, phone, location)
 * @access  Private
 */
router.patch(
  "/me",
  authenticate,
  userController.updateProfile
);

/* -------------------------------------------------------------------------- */
/*                          🖼️ UPDATE USER AVATAR                             */
/* -------------------------------------------------------------------------- */
/**
 * @route   POST /api/users/avatar
 * @desc    Upload/replace user avatar (Cloudinary)
 * @access  Private
 */
router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  upload.handleErrors,        // 🔥 Ensures clean error responses
  userController.uploadAvatar
);

/* -------------------------------------------------------------------------- */
/*                            📊 USER STATISTICS                               */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/users/stats
 * @desc    Fetch eco stats (reports, points, badges, etc)
 * @access  Private
 */
router.get(
  "/stats",
  authenticate,
  userController.getStats
);

/* -------------------------------------------------------------------------- */
/*                            🏆 ECO LEADERBOARD                               */
/* -------------------------------------------------------------------------- */
/**
 * @route   GET /api/users/leaderboard
 * @query   ?page=1&limit=20&timeframe=all|week|month
 * @desc    Global leaderboard (users + green champions)
 * @access  Private
 */
router.get(
  "/leaderboard",
  authenticate,
  userController.getLeaderboard
);

module.exports = router;
