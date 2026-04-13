/* =============================================================================
 * OTP Model (Email/Phone)
 * =============================================================================
 * Purpose:
 *   Store one-time passwords for verification and password reset flows.
 *
 * Security:
 *   - OTP values are hashed in `pre('save')` and never selected in queries
 *     (schema uses `select: false`).
 *   - Supports both email-based and phone-based OTPs via `email` and `phone`
 *     fields.
 *
 * ============================================================================= */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema(
  {
    /* TARGET USER (Email or Phone) */
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    /* OTP VALUE (hashed) */
    otp: {
      type: String,
      required: true,
      select: false, // 🔒 Never return OTP in API
    },

    /* META INFORMATION */
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },

    purpose: {
      type: String,
      enum: ["verification", "login", "reset-password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    attempts: {
      type: Number,
      default: 0, // to prevent brute force
    },

    lockedUntil: {
      type: Date,
      default: null, // optional lock period after too many attempts
    },
  },
  { timestamps: true }
);

/* REQUIRE AT LEAST ONE OF email OR phone */
otpSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error("Either email or phone is required");
  }

  // Ensure type matches data presence
  if (this.type === "email" && !this.email) {
    throw new Error("OTP type 'email' requires an email field");
  }
  if (this.type === "phone" && !this.phone) {
    throw new Error("OTP type 'phone' requires a phone field");
  }
});

/* TTL — Auto Delete After Expiry */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* UNIQUE ACTIVE OTP PER (email/phone + purpose)
   Use partialFilterExpression so uniqueness applies only for active (isUsed: false) docs.
*/
otpSchema.index(
  { email: 1, purpose: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true }, isUsed: false },
  }
);
otpSchema.index(
  { phone: 1, purpose: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true }, isUsed: false },
  }
);

/* HASH OTP BEFORE SAVE */
otpSchema.pre("save", async function () {
  // Normalize inputs
  if (this.email) this.email = this.email.trim().toLowerCase();
  if (this.phone) this.phone = this.phone.trim();

  if (!this.isModified("otp")) return;

  // hash OTP securely
  this.otp = await bcrypt.hash(this.otp, 10);
});

/* COMPARE OTP */
otpSchema.methods.compareOTP = function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.otp);
};

/* Increment attempts and optionally lock */
otpSchema.methods.incrementAttempts = async function (opts = {}) {
  const { maxAttempts = 5, lockMinutes = 10 } = opts;
  this.attempts = (this.attempts || 0) + 1;

  if (this.attempts >= maxAttempts) {
    // set a temporary lock window to mitigate brute force
    this.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
  }
  await this.save();
  return this;
};

/* Check whether OTP is currently locked due to too many attempts */
otpSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  return new Date() < new Date(this.lockedUntil);
};

module.exports = mongoose.model("OTP", otpSchema);
