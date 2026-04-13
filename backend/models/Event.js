/* =============================================================================
 * Event Model
 * =============================================================================
 * Purpose:
 *   Represent events created/organized for EcoTrack community engagement.
 *   Used by the Green Champion role to display event lists.
 *
 * Key Features:
 *   - Schema fields for title/description/date/participants/tags
 *   - `createdAt`/`updatedAt` timestamps
 *
 * Env Vars:
 *   None.
 * ============================================================================= */

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        BASIC DETAILS
    --------------------------------------------------------- */
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    /* ---------------------------------------------------------
        EVENT DATE / TIME
    --------------------------------------------------------- */
    date: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },

    /* ---------------------------------------------------------
        EVENT STATUS
        auto-updated using pre-save hook
    --------------------------------------------------------- */
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },

    /* ---------------------------------------------------------
        LOCATION (supports both text + map coordinates)
    --------------------------------------------------------- */
    location: {
      address: { type: String, trim: true },

      // Optional GeoJSON coords (longitude, latitude)
      coordinates: {
        type: [Number],
        index: "2dsphere",
        default: undefined,
      },
    },

    /* ---------------------------------------------------------
        PARTICIPANTS
    --------------------------------------------------------- */
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    maxParticipants: {
      type: Number,
      default: 0, // 0 = unlimited
    },

    /* ---------------------------------------------------------
        EXTRA INFO
    --------------------------------------------------------- */
    bannerImage: { type: String, trim: true },

    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    PRE-SAVE HOOK — AUTO-UPDATE STATUS
--------------------------------------------------------- */
eventSchema.pre("save", function () {
  if (!this.date) return;

  const now = new Date();

  if (this.status !== "cancelled") {
    if (this.date > now) this.status = "upcoming";
    else if (this.date.toDateString() === now.toDateString())
      this.status = "ongoing";
    else this.status = "completed";
  }
});

/* ---------------------------------------------------------
    STATIC METHODS
--------------------------------------------------------- */

// Get upcoming events
eventSchema.statics.getUpcoming = function (limit = 10) {
  return this.find({ status: "upcoming" }).sort({ date: 1 }).limit(limit);
};

// Get events user participates in
eventSchema.statics.getUserEvents = function (userId) {
  return this.find({ participants: userId }).sort({ date: 1 });
};

// Add participant safely
eventSchema.statics.joinEvent = async function (eventId, userId) {
  const event = await this.findById(eventId);

  if (!event) throw new Error("Event not found");
  if (event.status === "completed" || event.status === "cancelled")
    throw new Error("Cannot join a completed/cancelled event");

  if (
    event.maxParticipants > 0 &&
    event.participants.length >= event.maxParticipants
  ) {
    throw new Error("Event is full");
  }

  if (!event.participants.includes(userId)) {
    event.participants.push(userId);
    await event.save();
  }

  return event;
};

module.exports = mongoose.model("Event", eventSchema);
