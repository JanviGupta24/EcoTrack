/* =============================================================================
 * MongoDB Index Cleanup Script
 * =============================================================================
 * Purpose:
 *   Connect to the configured MongoDB database and (optionally) normalize
 *   indexes by removing duplicated or outdated indexes.
 *
 * Notes:
 *   - Intended for development/ops maintenance, not for production runtime.
 *   - Uses `process.env.MONGODB_URI`.
 *
 * Env Vars:
 *   - MONGODB_URI
 * ============================================================================= */
const mongoose = require("mongoose");

require("dotenv").config();

const collections = [
  "notifications",
  "transactions",
  "resources",
  "wastereports",
  "events",
  "facilities",
  "otps",
  "trainings",
  "users",
];

async function cleanIndexes() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🔥 Starting index cleanup...");

    const db = mongoose.connection.db;

    for (const name of collections) {
      try {
        const collection = db.collection(name);

        const indexInfo = await collection.indexes();

        console.log(`\n📌 Checking: ${name}`);
        console.log(`   Found indexes: ${indexInfo.length}`);

        for (const idx of indexInfo) {
          const indexName = idx.name;

          if (indexName === "_id_") continue; // keep default index

          console.log(`   ⚠ Dropping index: ${indexName}`);
          await collection.dropIndex(indexName);
        }

        console.log(`   ✅ Cleaned ${name}`);
      } catch (err) {
        console.log(`   ❌ Error cleaning ${name}:`, err.message);
      }
    }

    console.log("\n🎉 DONE — All duplicate indexes removed successfully!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

cleanIndexes();
