// models/Facility.js
const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        BASIC DETAILS
    --------------------------------------------------------- */
    name: {
      type: String,
      required: [true, "Facility name is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    /* ---------------------------------------------------------
        FACILITY TYPE
    --------------------------------------------------------- */
    type: {
      type: String,
      enum: [
        "collection-center",
        "recycling-plant",
        "composting-unit",
        "disposal-site",
        "sorting-station",
        "material-recovery-facility",
      ],
      required: [true, "Facility type is required"],
      index: true,
    },

    /* ---------------------------------------------------------
        LOCATION (GeoJSON + address)
    --------------------------------------------------------- */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: "Location must be [longitude, latitude]",
        },
      },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },

    /* ---------------------------------------------------------
        CAPACITY + LOAD (Auto-status)
    --------------------------------------------------------- */
    capacity: {
      type: Number,
      min: [0, "Capacity cannot be negative"],
      required: [true, "Facility capacity is required"],
    },

    currentLoad: {
      type: Number,
      default: 0,
      min: [0, "Current load cannot be negative"],
    },

    totalProcessed: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ---------------------------------------------------------
        ACCEPTED WASTE TYPES
    --------------------------------------------------------- */
    acceptedWasteTypes: {
      type: [String],
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
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one accepted waste type is required",
      },
    },

    /* ---------------------------------------------------------
        OPERATING HOURS
    --------------------------------------------------------- */
    operatingHours: {
      open: { type: String, default: "08:00" },
      close: { type: String, default: "18:00" },
      workingDays: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
    },

    /* ---------------------------------------------------------
        CONTACT
    --------------------------------------------------------- */
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      manager: { type: String, trim: true },
    },

    /* ---------------------------------------------------------
        STATUS
        Auto-updated based on load
    --------------------------------------------------------- */
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance", "full"],
      default: "active",
      index: true,
    },

    /* ---------------------------------------------------------
        RATING
    --------------------------------------------------------- */
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    INDEXES
--------------------------------------------------------- */
facilitySchema.index({ location: "2dsphere" });
facilitySchema.index({ city: 1, type: 1, status: 1 });

/* ---------------------------------------------------------
    VIRTUAL — Load percentage
--------------------------------------------------------- */
facilitySchema.virtual("loadPercentage").get(function () {
  if (!this.capacity || this.capacity === 0) return 0;
  return Math.min((this.currentLoad / this.capacity) * 100, 100);
});

/* ---------------------------------------------------------
    PRE-SAVE — Auto-update status
--------------------------------------------------------- */
facilitySchema.pre("save", function (next) {
  if (this.currentLoad >= this.capacity) {
    this.status = "full";
  } else if (this.status === "full" && this.currentLoad < this.capacity) {
    this.status = "active";
  }
  next();
});

/* ---------------------------------------------------------
    STATIC — Find facilities near a coordinate
--------------------------------------------------------- */
facilitySchema.statics.findNearby = async function (
  lng,
  lat,
  maxDistance = 5000
) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistance, // meters
      },
    },
  });
};

/* ---------------------------------------------------------
    STATIC — Increase processed load
--------------------------------------------------------- */
facilitySchema.statics.incrementProcessed = async function (facilityId, kg) {
  return this.findByIdAndUpdate(
    facilityId,
    {
      $inc: { totalProcessed: kg },
    },
    { new: true }
  );
};

/* ---------------------------------------------------------
    EXPORT
--------------------------------------------------------- */
module.exports = mongoose.model("Facility", facilitySchema);
