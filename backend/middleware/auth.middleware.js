// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ==========================================================================
      🔐 AUTHENTICATE USER — REQUIRED FOR PROTECTED ROUTES
============================================================================ */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Must contain Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token",
      });
    }

    // 3️⃣ Fetch user but exclude sensitive fields
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    // 4️⃣ Block banned accounts
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned.",
      });
    }

    // ✅ Attach authenticated user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ AUTHENTICATION ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Authentication processing failed",
    });
  }
};

/* ==========================================================================
      🎯 ROLE-BASED ACCESS CONTROL
============================================================================ */
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

/* ==========================================================================
      🌿 ALLOW ONLY GREEN CHAMPIONS
============================================================================ */
exports.protectChampion = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "green_champion") {
    return res.status(403).json({
      success: false,
      message: "Only Green Champions can access this resource.",
    });
  }

  next();
};
