/**
 * utils/clearDatabase.js
 * Safely wipes ALL model data without dropping DB
 *
 * Usage:
 * 1. Set MONGODB_URI in .env
 * 2. node utils/clearDatabase.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ✅ Import all models used in project
const User = require("../models/User");
const Facility = require("../models/Facility");
const Training = require("../models/Training");
const WasteReport = require("../models/WasteReport");
const Transaction = require("../models/Transaction");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const OTP = require("../models/OTP");
const Resource = require("../models/Resource");

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ Connected to MongoDB");
}

async function clearDatabase() {
  try {
    await connectDB();

    console.log("\n🧹 Clearing all collections...");

    const models = [
      User,
      Facility,
      Training,
      WasteReport,
      Transaction,
      Event,
      Notification,
      OTP,
      Resource,
    ];

    for (const model of models) {
      try {
        const result = await model.deleteMany({});
        console.log(`✅ Cleared ${model.modelName}: ${result.deletedCount} docs removed`);
      } catch (err) {
        console.warn(`⚠️ Failed clearing ${model.modelName} — maybe doesn't exist yet`);
      }
    }

    console.log("\n🎉 All model data erased successfully!");

    await mongoose.connection.close();
    console.log("👋 MongoDB connection closed. Done.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while clearing database:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

clearDatabase();
