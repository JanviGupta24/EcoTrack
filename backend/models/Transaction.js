/* =============================================================================
 * Transaction Model (Wallet / Eco Points)
 * =============================================================================
 * Purpose:
 *   Record wallet-related events:
 *   - eco-points earning and redemption
 *   - payment received (gateway status tracking)
 *   - reward claims and wallet top-ups
 *
 * Key Behaviors:
 *   - References `userId` and optionally links to related objects
 *   - Tracks `status` and payment identifiers (`paymentId`, `orderId`)
 *   - Holds flexible `metadata` for gateway-specific payloads
 *
 * Env Vars:
 *   None.
 * ============================================================================= */
// ------------------------------------------------------------
// CLEAN VERSION — duplicate indexes removed safely
// Fully commented version for clarity
// ------------------------------------------------------------

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
        USER (OWNER OF TRANSACTION)
        - Indexed for faster user statements
    --------------------------------------------------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------------------------------------------------------
        TYPE OF TRANSACTION
        - Removed duplicate index
        - Indexed properly below
    --------------------------------------------------------- */
    type: {
      type: String,
      enum: [
        "eco-points-earned",
        "eco-points-redeemed",
        "payment-received",
        "wallet-topup",
        "wallet-withdrawal",
        "reward-claimed",
      ],
      required: true,
    },

    /* ---------------------------------------------------------
        MONEY AMOUNT
        - Not used for eco-point-only transactions
    --------------------------------------------------------- */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ---------------------------------------------------------
        ECO POINT CHANGES
    --------------------------------------------------------- */
    ecoPoints: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    /* ---------------------------------------------------------
        CATEGORY
        - duplicate index removed from field
    --------------------------------------------------------- */
    category: {
      type: String,
      enum: ["eco", "payment", "reward", "system"],
      default: "eco",
    },

    /* ---------------------------------------------------------
        OPTIONAL RELATIONSHIP LINKS
    --------------------------------------------------------- */
    relatedReport: { type: mongoose.Schema.Types.ObjectId, ref: "WasteReport" },
    relatedTraining: { type: mongoose.Schema.Types.ObjectId, ref: "Training" },
    relatedReward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },

    /* ---------------------------------------------------------
        PAYMENT DETAILS
    --------------------------------------------------------- */
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "wallet", "none"],
      default: "none",
    },

    /* ---------------------------------------------------------
        IDs FOR PAYMENT GATEWAY
        - removed index: true duplicates
        - Indexed properly below
    --------------------------------------------------------- */
    paymentId: String,
    orderId: String,

    /* ---------------------------------------------------------
        STATUS OF TRANSACTION
    --------------------------------------------------------- */
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    /* ---------------------------------------------------------
        FLEXIBLE EXTRA INFO
    --------------------------------------------------------- */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
    INDEXES (Correct — no duplicates)
--------------------------------------------------------- */
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ orderId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
