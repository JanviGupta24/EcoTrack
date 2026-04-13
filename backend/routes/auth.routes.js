/* =============================================================================
 * Auth Routes
 * =============================================================================
 * Purpose:
 *   Provide authentication and account management endpoints:
 *   - Register, login
 *   - Google OAuth login
 *   - OTP send/verify (email/phone)
 *   - Password reset (OTP-based)
 *   - Refresh token
 *   - Logout
 *
 * Security:
 *   - Uses rate limiting to reduce abuse.
 *   - Uses request validation via `express-validator`.
 * ============================================================================= */
const express = require("express");
const router = express.Router();

// Controllers
const authController = require("../controllers/auth.controller");

// Middlewares
const { authenticate } = require("../middleware/auth.middleware");
const validation = require("../middleware/validation");
const rateLimit = require("express-rate-limit");

// Validation shortcuts
const registerValidation = validation.registerValidation;
const loginValidation = validation.loginValidation;
const otpValidation = validation.otpValidation;
const resetPasswordValidation = validation.resetPasswordValidation;
const validate = validation.validate;

/* ------------------------------------------------------------------ */
/*                         RATE LIMITER                               */
/* ------------------------------------------------------------------ */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

/* ------------------------------------------------------------------ */
/*                           AUTH ROUTES                              */
/* ------------------------------------------------------------------ */

/* -------------------- REGISTER -------------------- */
router.post(
  "/register",
  authLimiter,
  registerValidation,
  validate,
  authController.register
);

/* -------------------- LOGIN -------------------- */
router.post(
  "/login",
  authLimiter,
  loginValidation,
  validate,
  authController.login
);

/* -------------------- GOOGLE LOGIN -------------------- */
router.post("/google-login", authLimiter, authController.googleLogin);

/* -------------------- SEND OTP -------------------- */
router.post(
  "/send-otp",
  authLimiter,
  otpValidation,
  validate,
  authController.sendOTP
);

/* -------------------- VERIFY OTP -------------------- */
router.post(
  "/verify-otp",
  authLimiter,
  otpValidation,
  validate,
  authController.verifyOTP
);

/* -------------------- FORGOT PASSWORD -------------------- */
router.post(
  "/forgot-password",
  authLimiter,
  (req, res, next) => {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    next();
  },
  authController.forgotPassword
);

/* -------------------- VERIFY RESET PASSWORD OTP -------------------- */
router.post(
  "/verify-reset-otp",
  authLimiter,
  (req, res, next) => {
    if (!req.body.email || !req.body.otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    next();
  },
  authController.verifyResetOTP
);

/* -------------------- RESET PASSWORD -------------------- */
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

/* -------------------- REFRESH TOKEN -------------------- */
router.post("/refresh", authController.refreshToken);

/* ✅ BACKWARD COMPATIBILITY — OPTIONAL */
router.post("/refresh-token", authController.refreshToken);

/* -------------------- LOGOUT -------------------- */
// ❌ No authenticate middleware — prevents infinite 401 loop
router.post("/logout", authController.logout);

module.exports = router;
