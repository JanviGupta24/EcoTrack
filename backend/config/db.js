/* =============================================================================
 * MongoDB Connection Configuration
 * =============================================================================
 * Purpose:
 *   Provide a single `connectDB()` helper used by the Express server to connect
 *   Mongoose to MongoDB (local or Atlas) using `process.env.MONGODB_URI`.
 *
 * Key Behavior:
 *   - Uses `serverSelectionTimeoutMS` to fail fast in development.
 *   - Retries connection once after a short delay if initial connection fails.
 *
 * Env Vars:
 *   - `MONGODB_URI` (optional): defaults to `mongodb://localhost:27017/ecotrack`
 * ============================================================================= */

const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                          🗄️ MONGOOSE GLOBAL SETTINGS                        */
/* -------------------------------------------------------------------------- */
mongoose.set("strictQuery", true); // suppress Mongoose 7/8 deprecation warning

/* -------------------------------------------------------------------------- */
/*                          🔗 CONNECT TO MONGODB                              */
/* -------------------------------------------------------------------------- */
const connectDB = async () => {
  const URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecotrack";

  try {
    const conn = await mongoose.connect(URI, {
      // Mongoose 8 dropped many legacy options – keep only valid ones
      serverSelectionTimeoutMS: 5000,  // fail fast in dev
      socketTimeoutMS: 45000,
    });

    console.log(
      `✅ MongoDB connected: ${conn.connection.host} — DB: ${conn.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    // Retry once after 5 seconds before crashing the process
    setTimeout(async () => {
      try {
        await mongoose.connect(URI);
        console.log("✅ MongoDB reconnected after retry");
      } catch (retryError) {
        console.error(
          "❌ MongoDB retry failed. Exiting process:",
          retryError.message
        );
        process.exit(1);
      }
    }, 5000);
  }
};

/* -------------------------------------------------------------------------- */
/*                        🔔 CONNECTION EVENT LISTENERS                        */
/* -------------------------------------------------------------------------- */
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔁 MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err.message);
});

module.exports = connectDB;
