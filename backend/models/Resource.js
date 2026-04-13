/* =============================================================================
 * Resource Model
 * =============================================================================
 * Purpose:
 *   Store community/government learning resources (documents, videos,
 *   articles, etc.) with categorization and optional public visibility.
 *
 * Key Features:
 *   - Supports `category`, `type`, `tags` for filtering
 *   - Geo/text search via indexes (`title` + `description` text index)
 *   - `isPublic` toggles whether resources appear publicly
 * ============================================================================= */
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
/* Text index: tags are an array — do not mix into text index (MongoDB 201 error). */
resourceSchema.index({ title: "text", description: "text" });
resourceSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
