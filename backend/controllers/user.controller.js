// controllers/user.controller.js
const User = require("../models/User");
const WasteReport = require("../models/WasteReport");
const Transaction = require("../models/Transaction");
const cloudinary = require("../config/cloudinary");

/* -------------------------------------------------------------------------- */
/*                               GET PROFILE                                   */
/* -------------------------------------------------------------------------- */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -refreshToken")
      .populate("certifications.courseId", "title");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ getProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user profile" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               UPDATE PROFILE                                */
/* -------------------------------------------------------------------------- */
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "location"];
    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key]) updateData[key] = req.body[key];
    }

    if (updateData.location) {
      const loc = updateData.location;
      updateData.location = {
        type: "Point",
        coordinates: loc.coordinates || [0, 0],
        address: loc.address || "",
        city: loc.city || "",
        state: loc.state || "",
        zipCode: loc.zipCode || "",
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               UPLOAD AVATAR                                 */
/* -------------------------------------------------------------------------- */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const newAvatarUrl = req.file.path;

    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.includes("cloudinary")) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`ecotrack/uploads/${publicId}`);
      } catch (delErr) {
        console.warn("⚠️ Failed to delete old avatar:", delErr.message);
      }
    }

    user.avatar = newAvatarUrl;
    await user.save();

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("❌ uploadAvatar error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload avatar" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                  GET STATS                                  */
/* -------------------------------------------------------------------------- */
/* ⭐⭐⭐ REQUIRED CHANGES DONE HERE ONLY ⭐⭐⭐ */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await WasteReport.find({ reporterId: userId });

    const totalReports = reports.length;

    const weightMap = { small: 1, medium: 3, large: 5 };

    /* ----------------------- TOTAL KG CALCULATION ----------------------- */
    const totalWasteKg = reports.reduce(
      (sum, r) => sum + (weightMap[r.quantity] || 0),
      0
    );

    /* ----------------------- WASTE DISTRIBUTION ------------------------- */
    const distribution = {};

    reports.forEach((r) => {
      const kg = weightMap[r.quantity] || 0;
      if (!distribution[r.wasteType]) distribution[r.wasteType] = 0;
      distribution[r.wasteType] += kg;
    });

    const wasteDistribution = Object.keys(distribution).map((type) => ({
      name: type,
      value: distribution[type],
    }));

    /* -------------------------- ECO RANK -------------------------- */
    const usersAhead = await User.countDocuments({
      ecoPoints: { $gt: req.user.ecoPoints },
    });
    const rank = usersAhead + 1;

    /* -------------------- MONTHLY ACTIVITY ------------------------ */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await WasteReport.aggregate([
      {
        $match: {
          reporterId: userId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
          },
          reports: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        collectedReports: reports.filter((r) =>
          ["collected", "processed", "completed"].includes(r.status)
        ).length,
        totalEcoPoints: req.user.ecoPoints,
        totalWasteKg,
        wasteDistribution, // ⭐ ADDED FOR DASHBOARD
        rank,
        badges: req.user.badges?.length || 0,
        monthlyActivity: monthlyActivity.map((m) => ({
          month: new Date(m._id.y, m._id.m - 1).toLocaleString("default", {
            month: "short",
          }),
          reports: m.reports,
        })),
      },
    });
  } catch (error) {
    console.error("❌ getStats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               LEADERBOARD                                   */
/* -------------------------------------------------------------------------- */
exports.getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const leaderboard = await User.find({
      role: { $in: ["user", "green_champion"] },
    })
      .select("name avatar ecoPoints reportsCount")
      .sort({ ecoPoints: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const leaderboardWithRank = leaderboard.map((u, idx) => ({
      rank: (page - 1) * limit + idx + 1,
      user: u,
    }));

    const usersAhead = await User.countDocuments({
      ecoPoints: { $gt: req.user.ecoPoints },
    });

    res.json({
      success: true,
      leaderboard: leaderboardWithRank,
      currentUser: {
        rank: usersAhead + 1,
        ecoPoints: req.user.ecoPoints,
      },
    });
  } catch (error) {
    console.error("❌ getLeaderboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch leaderboard" });
  }
};
