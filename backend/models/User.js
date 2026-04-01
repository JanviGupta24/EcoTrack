// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        BASIC USER PROFILE
    --------------------------------------------------------- */
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    phone: {
      type: String,
      sparse: true,
      trim: true,
    },

    /* ---------------------------------------------------------
        AUTHENTICATION
    --------------------------------------------------------- */
    password: {
      type: String,
      minlength: 6,
      select: false,
      default: null, // Google accounts allowed
    },

    googleId: {
      type: String,
      sparse: true,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    /* ---------------------------------------------------------
        USER ROLE & STATUS
    --------------------------------------------------------- */
    role: {
      type: String,
      enum: ["user", "worker", "admin", "super_admin", "green_champion"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },

    avatar: { type: String },

    /* ---------------------------------------------------------
        VERIFICATION
    --------------------------------------------------------- */
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    /* ---------------------------------------------------------
        ECO TRACK DATA
    --------------------------------------------------------- */
    ecoPoints: { type: Number, default: 0, min: 0 },
    walletBalance: { type: Number, default: 0, min: 0 },

    /* ---------------------------------------------------------
        LOCATION (GEO JSON)
    --------------------------------------------------------- */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
    },

    /* ---------------------------------------------------------
        ACHIEVEMENTS
    --------------------------------------------------------- */
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    certifications: [
      {
        courseId: mongoose.Schema.Types.ObjectId,
        courseName: String,
        completedAt: Date,
        certificateUrl: String,
      },
    ],

    /* ---------------------------------------------------------
        WORKER & CHAMPION DATA
    --------------------------------------------------------- */
    assignedArea: { type: String },
    workerId: { type: String },

    reportsCount: { type: Number, default: 0 },
    collectionsCount: { type: Number, default: 0 },

    /* ---------------------------------------------------------
        TIMESTAMPS
    --------------------------------------------------------- */
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    GEO INDEX
--------------------------------------------------------- */
userSchema.index({ location: "2dsphere" });

/* ---------------------------------------------------------
    PASSWORD HASHING BEFORE SAVE
--------------------------------------------------------- */
userSchema.pre("save", async function (next) {
  // Skip hashing ONLY for Google accounts (password = null)
  if (this.password === null) return next();

  // Prevent empty string passwords
  if (this.password === "") {
    return next(new Error("Password cannot be empty"));
  }

  // Strong password enforcement
  if (
    this.isModified("password") &&
    this.password &&
    this.password.length < 6
  ) {
    return next(new Error("Password must be at least 6 characters long"));
  }

  // Hash only when modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ---------------------------------------------------------
    COMPARE PASSWORD
--------------------------------------------------------- */
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false; // Google accounts
  return bcrypt.compare(candidatePassword, this.password);
};

/* ---------------------------------------------------------
    HIDE SENSITIVE FIELDS
--------------------------------------------------------- */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
