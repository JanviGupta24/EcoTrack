// middleware/validation.middleware.js
const { body, validationResult } = require("express-validator");

/* ------------------------------------------------------------------
    GLOBAL VALIDATION HANDLER
------------------------------------------------------------------ */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }
  next();
};

/* ------------------------------------------------------------------
    REGISTER VALIDATION
------------------------------------------------------------------ */
exports.registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long")
    .matches(/^[A-Za-z\s.'-]+$/)
    .withMessage("Name contains invalid characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter"),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
];

/* ------------------------------------------------------------------
    LOGIN VALIDATION
------------------------------------------------------------------ */
exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

/* ------------------------------------------------------------------
    OTP VALIDATION (FOR /send-otp AND /verify-otp)
------------------------------------------------------------------ */
exports.otpValidation = [
  body("type")
    .notEmpty()
    .withMessage("OTP type is required")
    .isIn(["email", "phone"])
    .withMessage("OTP type must be 'email' or 'phone'"),

  body("purpose")
    .notEmpty()
    .withMessage("OTP purpose is required")
    .isIn(["verification", "login"])
    .withMessage("OTP purpose must be 'verification' or 'login'"),

  // At least one target must exist
  body("email")
    .optional()
    .if(body("type").equals("email"))
    .isEmail()
    .withMessage("Valid email required for email OTP"),

  body("phone")
    .optional()
    .if(body("type").equals("phone"))
    .isMobilePhone("any")
    .withMessage("Valid phone required for phone OTP"),

  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error("Either email or phone is required");
    }
    return true;
  }),
];

/* ------------------------------------------------------------------
    RESET PASSWORD VALIDATION (NO OTP HERE ANYMORE)
------------------------------------------------------------------ */
exports.resetPasswordValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required"),

  body("newPassword")
    .trim()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/[0-9]/)
    .withMessage("New password must contain a number")
    .matches(/[A-Za-z]/)
    .withMessage("New password must contain a letter"),
];

/* ------------------------------------------------------------------
    VERIFY RESET PASSWORD OTP VALIDATION
------------------------------------------------------------------ */
exports.verifyResetOTPValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4–6 digits"),
];

/* ------------------------------------------------------------------
    WASTE REPORT VALIDATION
------------------------------------------------------------------ */
exports.wasteReportValidation = [
  body("wasteType")
    .notEmpty()
    .withMessage("Waste type is required")
    .isIn([
      "plastic",
      "metal",
      "organic",
      "e-waste",
      "glass",
      "paper",
      "mixed",
      "hazardous",
    ])
    .withMessage("Invalid waste type"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isIn(["small", "medium", "large"])
    .withMessage("Invalid quantity"),

  body("location").custom((value, { req }) => {
    if (!value) throw new Error("Location is required");

    let loc = value;

    if (typeof loc === "string") {
      try {
        loc = JSON.parse(loc);
      } catch {
        throw new Error("Location must be valid JSON");
      }
    }

    if (
      !loc.coordinates ||
      !Array.isArray(loc.coordinates) ||
      loc.coordinates.length !== 2
    ) {
      throw new Error("Location must contain coordinates [lng, lat]");
    }

    const [lng, lat] = loc.coordinates;

    if (typeof lng !== "number" || typeof lat !== "number") {
      throw new Error("Coordinates must be numeric");
    }

    req.body.location = loc;
    return true;
  }),
];
