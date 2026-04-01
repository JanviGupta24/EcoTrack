// models/Resource.js
// ------------------------------------------------------------
// CLEAN VERSION — removed duplicate category index
// Fully documented for clarity
// ------------------------------------------------------------

const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        RESOURCE TITLE
    --------------------------------------------------------- */
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    /* ---------------------------------------------------------
        DESCRIPTION
    --------------------------------------------------------- */
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    /* ---------------------------------------------------------
        RESOURCE URL
    --------------------------------------------------------- */
    link: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)/, "URL must start with http or https"],
    },

    /* ---------------------------------------------------------
        CATEGORY
        - Duplicate index removed from field
        - Indexed correctly below
    --------------------------------------------------------- */
    category: {
      type: String,
      enum: [
        "waste-management",
        "recycling",
        "training",
        "community",
        "government",
        "environment",
        "education",
        "other",
      ],
      default: "other",
    },

    /* ---------------------------------------------------------
        RESOURCE TYPE
    --------------------------------------------------------- */
    type: {
      type: String,
      enum: ["pdf", "video", "article", "website", "document", "other"],
      default: "article",
    },

    /* ---------------------------------------------------------
        TAGS FOR SEARCHING
    --------------------------------------------------------- */
    tags: {
      type: [String],
      default: [],
      index: true, // tag search needs this
    },

    /* ---------------------------------------------------------
        OPTIONAL METADATA
    --------------------------------------------------------- */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ---------------------------------------------------------
        PUBLIC / PRIVATE ACCESS
    --------------------------------------------------------- */
    isPublic: {
      type: Boolean,
      default: true,
      index: true, // useful for filtering lists
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    TEXT + CATEGORY INDEXES
--------------------------------------------------------- */
resourceSchema.index({ title: "text", description: "text", tags: 1 });
resourceSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
