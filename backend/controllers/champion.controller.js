/* =============================================================================
 * Champion Controller (Green Champion Role)
 * =============================================================================
 * Purpose:
 *   Provide endpoints used by `green_champion` users to access:
 *   - Community dashboards
 *   - Associated waste reports and engagement metrics
 *   - Events list
 *   - Public learning/community resources
 *
 * Env Vars:
 *   - None required by default.
 * ============================================================================= */

const User = require("../models/User");
const WasteReport = require("../models/WasteReport");
const Event = require("../models/Event");
const Training = require("../models/Training");

/**
 * 🌿 Green Champion Dashboard Controller
 */
exports.getDashboard = async (req, res) => {
  try {
    // ✅ Total users (community members)
    const totalUsers = await User.countDocuments({ role: "user" });

    // ✅ Waste report stats
    const totalReports = await WasteReport.countDocuments();
    const resolvedReports = await WasteReport.countDocuments({
      status: "resolved",
    });

    // ✅ Fetch latest 5 community reports
    const recentReports = await WasteReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("wasteType status createdAt location description");

    // ✅ Fetch 3 upcoming events
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(3)
      .select("title location date description");

    // ✅ Calculate impact points
    const impactPoints = resolvedReports * 20;

    // ✅ Send dashboard response
    res.status(200).json({
      success: true,
      data: {
        communityMembers: totalUsers,
        reportsHandled: resolvedReports,
        impactPoints,
        coverageKm: Math.ceil(totalReports / 5),
        recentReports,
        events,
      },
    });
  } catch (err) {
    console.error("Champion Dashboard Error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Could not load Green Champion Dashboard data.",
      });
  }
};

/**
 * 🗑️ Fetch All Community Reports
 */
exports.getReports = async (req, res) => {
  try {
    const reports = await WasteReport.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("wasteType status createdAt location description");
    res.status(200).json({ success: true, reports });
  } catch (err) {
    console.error("Champion Reports Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
};

/**
 * 📅 Fetch Upcoming Events
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(5)
      .select("title location date description");
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error("Champion Events Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
    });
  }
};

/**
 * 📚 Fetch Learning Resources (Training)
 */
exports.getResources = async (req, res) => {
  try {
    const resources = await Training.find().limit(8);
    res.status(200).json({ success: true, resources });
  } catch (err) {
    console.error("Champion Resources Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resources.",
    });
  }
};
