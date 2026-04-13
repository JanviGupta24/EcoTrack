/* =============================================================================
 * Notification Model
 * =============================================================================
 * Purpose:
 *   Persist in-app notifications for users. Supports:
 *   - read/unread state with `readAt`
 *   - soft-archive via `archived`
 *   - metadata payloads for contextual UI
 *
 Key Behaviors:
 *   - Indexed for efficient timeline queries
 *   - Pre-save hook sets `readAt` when `isRead` becomes true
 *   - Static helper: `markAllAsRead(userId)`
 ============================================================================= */
// ------------------------------------------------------------
// CLEAN VERSION — All duplicate indexes removed
// Added full explanations for every field and operation
// ------------------------------------------------------------

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        USER RECEIVING THE NOTIFICATION
        - References a User document
        - Indexed for fast lookups
    --------------------------------------------------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------------------------------------------------------
        NOTIFICATION CONTENT
    --------------------------------------------------------- */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150, // keeps message short & clean
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // prevents extremely long messages
    },

    /* ---------------------------------------------------------
        NOTIFICATION TYPE
        - Removed index: true (duplicate)
        - Index is defined later using schema.index()
    --------------------------------------------------------- */
    type: {
      type: String,
      enum: [
        "system",
        "report-update",
        "payment",
        "achievement",
        "assignment",
        "alert",
        "reward",
        "otp",
        "security",
        "activity",
      ],
      default: "system",
    },

    /* ---------------------------------------------------------
        PRIORITY LEVEL
        - Duplicate index removed
    --------------------------------------------------------- */
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
    },

    /* ---------------------------------------------------------
        DELIVERY CHANNEL
        - Allows multi-channel notifications
    --------------------------------------------------------- */
    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "push", "all"],
      default: "in-app",
    },

    /* ---------------------------------------------------------
        READ STATUS
        - index removed to avoid duplicates
    --------------------------------------------------------- */
    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    /* ---------------------------------------------------------
        OPTIONAL ACTION BUTTON / CTA LINK
    --------------------------------------------------------- */
    link: {
      type: String,
      trim: true,
    },

    /* ---------------------------------------------------------
        OPTIONAL EXTRA DATA (FLEXIBLE JSON)
    --------------------------------------------------------- */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ---------------------------------------------------------
        ARCHIVED FLAG
        - index removed from field
        - indexed properly below
    --------------------------------------------------------- */
    archived: {
      type: Boolean,
      default: false,
    },

    /* ---------------------------------------------------------
        DEVICE-BASED READ SYNCING
    --------------------------------------------------------- */
    deviceId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    INDEXES (Correct indexes — no duplicates)
--------------------------------------------------------- */
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ archived: 1 });

/* ---------------------------------------------------------
    MIDDLEWARE — Auto update readAt when isRead becomes true
--------------------------------------------------------- */
notificationSchema.pre("save", function () {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
});

notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { userId, archived: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

module.exports = mongoose.model("Notification", notificationSchema);
