// models/Training.js
const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                             QUIZ SUB-SCHEMA                                */
/* -------------------------------------------------------------------------- */
const quizSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: "At least 2 options are required",
      },
      required: true,
    },
    answer: { type: String, required: true, trim: true },
    explanation: { type: String, trim: true },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                            MODULE SUB-SCHEMA                               */
/* -------------------------------------------------------------------------- */
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },

    videoUrl: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)/, "Video URL must be a valid link"],
    },

    duration: { type: Number, min: 1 }, // minutes
    quiz: [quizSchema],
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                         ASSIGNMENT SUB-SCHEMA                              */
/* -------------------------------------------------------------------------- */
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    resources: [String],
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                             TRAINING SCHEMA                                 */
/* -------------------------------------------------------------------------- */
const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: { type: String, trim: true },

    category: {
      type: String,
      enum: [
        "waste-segregation",
        "recycling",
        "composting",
        "sustainability",
        "policy",
        "awareness",
        "safety",
        "operations",
        "other",
      ],
      default: "sustainability",
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    ecoPointsReward: { type: Number, default: 0 },

    estimatedTime: { type: Number, min: 1 }, // minutes

    thumbnail: {
      type: String,
      trim: true,
      default:
        "https://images.unsplash.com/photo-1581574203019-7e37dedd3e8e?w=400&h=250&fit=crop&q=80",
    },

    modules: [moduleSchema],
    assignments: [assignmentSchema],

    /* ---------------------------------------------------------
        ENGAGEMENT TRACKING
    --------------------------------------------------------- */
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    completedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    /* ---------------------------------------------------------
        CERTIFICATE SUPPORT
    --------------------------------------------------------- */
    certificateTemplate: {
      type: String,
      trim: true,
      default: null,
    },

    certificateEnabled: {
      type: Boolean,
      default: true,
    },

    /* ---------------------------------------------------------
        ADMIN FIELDS
    --------------------------------------------------------- */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isActive: { type: Boolean, default: true },
    tags: { type: [String], index: true, default: [] },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/*                                   INDEXES                                  */
/* -------------------------------------------------------------------------- */
trainingSchema.index({ category: 1, difficulty: 1 });
trainingSchema.index({ title: "text", description: "text", tags: "text" });

/* -------------------------------------------------------------------------- */
/*                                  VIRTUALS                                  */
/* -------------------------------------------------------------------------- */
trainingSchema.virtual("totalModules").get(function () {
  return this.modules.length;
});

/* -------------------------------------------------------------------------- */
/*                                  METHODS                                   */
/* -------------------------------------------------------------------------- */

// Automatically calculate estimated time based on module durations
trainingSchema.methods.calculateEstimatedTime = function () {
  this.estimatedTime = this.modules.reduce(
    (sum, mod) => sum + (mod.duration || 0),
    0
  );
  return this.estimatedTime;
};

// Add rating and recalculate average
trainingSchema.methods.addRating = async function (rating) {
  this.averageRating =
    (this.averageRating * this.totalRatings + rating) / (this.totalRatings + 1);

  this.totalRatings += 1;
  await this.save();
};

// Mark course as completed for user
trainingSchema.methods.completeForUser = async function (userId) {
  if (!this.completedUsers.includes(userId)) {
    this.completedUsers.push(userId);
    await this.save();
  }
};

// Enroll user
trainingSchema.methods.enrollUser = async function (userId) {
  if (!this.enrolledUsers.includes(userId)) {
    this.enrolledUsers.push(userId);
    await this.save();
  }
};

module.exports = mongoose.model("Training", trainingSchema);
