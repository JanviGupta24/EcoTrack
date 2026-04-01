// models/WasteReport.js
const mongoose = require("mongoose");

/* TIMELINE SUB-SCHEMA */
const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

/* MAIN WASTE REPORT SCHEMA */
const wasteReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* LOCATION */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      city: String,
      state: String,
      landmark: String,
    },

    /* WASTE DETAILS */
    wasteType: {
      type: String,
      enum: [
        "plastic",
        "metal",
        "organic",
        "e-waste",
        "glass",
        "paper",
        "mixed",
        "hazardous",
      ],
      required: true,
    },

    // ORIGINAL FIELD (NO CHANGE)
    quantity: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },

    // ⭐ NEW FIELD FOR DASHBOARD KG CALCULATION
    quantityKg: {
      type: Number,
      default: 0,
    },

    description: { type: String, trim: true },
    images: { type: [String], default: [] },

    /* STATUS */
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "collected",
        "processed",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt: Date,
    startedAt: Date,
    collectedAt: Date,
    processedAt: Date,
    completedAt: Date,

    processedAtFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    aiPrediction: {
      wasteType: String,
      confidence: Number,
      detectedItems: [String],
    },

    ecoPointsAwarded: { type: Number, default: 0 },

    timeline: { type: [timelineSchema], default: [] },

    verificationPhoto: String,
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

/* INDEXES */
wasteReportSchema.index({ location: "2dsphere" });
wasteReportSchema.index({ status: 1, createdAt: -1 });
wasteReportSchema.index({ wasteType: 1, priority: 1 });

/* ⭐ PRE-SAVE HOOK TO AUTO-CONVERT quantity → quantityKg */
wasteReportSchema.pre("save", function (next) {
  const now = new Date();

  // Convert quantity size → KG
  if (this.isModified("quantity") || this.isNew) {
    switch (this.quantity) {
      case "small":
        this.quantityKg = 1;
        break;
      case "medium":
        this.quantityKg = 3;
        break;
      case "large":
        this.quantityKg = 5;
        break;
      default:
        this.quantityKg = 0;
    }
  }

  // Add initial timeline entry
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({ status: "pending", timestamp: now });
  }

  // Status changes → timeline update
  if (this.isModified("status") && !this.isNew) {
    if (this.status === "assigned" && !this.assignedAt) this.assignedAt = now;
    if (this.status === "in-progress" && !this.startedAt) this.startedAt = now;
    if (this.status === "collected" && !this.collectedAt)
      this.collectedAt = now;
    if (this.status === "processed" && !this.processedAt)
      this.processedAt = now;
    if (this.status === "completed" && !this.completedAt)
      this.completedAt = now;

    this.timeline.push({
      status: this.status,
      timestamp: now,
    });
  }

  next();
});

/* STATIC METHODS */
wasteReportSchema.statics.findNearby = async function (
  lng,
  lat,
  maxDistance = 3000
) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistance,
      },
    },
  });
};

wasteReportSchema.statics.assignWorker = async function (
  reportId,
  workerId,
  note = ""
) {
  const now = new Date();
  return this.findByIdAndUpdate(
    reportId,
    {
      assignedTo: workerId,
      assignedAt: now,
      status: "assigned",
      $push: {
        timeline: {
          status: "assigned",
          timestamp: now,
          note,
          updatedBy: workerId,
        },
      },
    },
    { new: true }
  );
};

module.exports = mongoose.model("WasteReport", wasteReportSchema);
