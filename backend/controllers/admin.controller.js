/* =============================================================================
 * Admin Controller
 * =============================================================================
 * Purpose:
 *   Provide super-admin functionality for operations and reporting:
 *   - Dashboard statistics (users/reports/facilities/revenue)
 *   - User/role management
 *   - Facility management
 *   - Analytics aggregation
 *   - Data export (JSON/CSV)
 *   - Assigning pending reports to workers
 *
 * Security:
 *   Enforced via `admin.routes.js` using `authenticate` + `authorize('admin','super_admin')`.
 * ============================================================================= */
const mongoose = require("mongoose");
const User = require("../models/User");
const WasteReport = require("../models/WasteReport");
const Facility = require("../models/Facility");
const Transaction = require("../models/Transaction");

const VALID_ROLES = [
  "user",
  "worker",
  "admin",
  "super_admin",
  "green_champion",
];

function startOfCurrentMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* -------------------------------------------------------------------------- */
/*                            📊 DASHBOARD STATS                               */
/* -------------------------------------------------------------------------- */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      totalFacilities,
      wasteTypeDistribution,
      monthlyReports,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      WasteReport.countDocuments(),
      WasteReport.countDocuments({ status: "pending" }),
      Facility.countDocuments(),
      WasteReport.aggregate([
        { $group: { _id: "$wasteType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WasteReport.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 24 },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: startOfCurrentMonth() },
            type: { $in: ["wallet-topup", "payment-received"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalReports,
        pendingReports,
        totalFacilities,
        totalRevenue,
        wasteTypeDistribution,
        monthlyReports,
      },
    });
  } catch (error) {
    console.error("❌ getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               👥 USERS                                      */
/* -------------------------------------------------------------------------- */
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || "").trim();
    const role = req.query.role;

    const filter = {};
    if (role && VALID_ROLES.includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { email: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = users.map((u) => u._id);
    const counts = await WasteReport.aggregate([
      { $match: { reporterId: { $in: ids } } },
      { $group: { _id: "$reporterId", reportsCount: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [String(c._id), c.reportsCount])
    );

    const usersWithCounts = users.map((u) => ({
      ...u,
      reportsCount: countMap[String(u._id)] || 0,
    }));

    res.json({
      success: true,
      users: usersWithCounts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("❌ getUsers:", error);
    res.status(500).json({ success: false, message: "Failed to list users" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const requesterIsSuper = req.user.role === "super_admin";
    if (!requesterIsSuper) {
      return res.status(403).json({
        success: false,
        message: "Only a super admin can change roles",
      });
    }

    if (target.role === "super_admin" && role !== "super_admin") {
      const superCount = await User.countDocuments({ role: "super_admin" });
      if (superCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last super admin",
        });
      }
    }

    if (role === "super_admin" && !requesterIsSuper) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    target.role = role;
    await target.save();

    const user = await User.findById(target._id)
      .select("-password -refreshToken")
      .lean();

    res.json({
      success: true,
      message: "Role updated",
      user: { ...user, reportsCount: await WasteReport.countDocuments({ reporterId: user._id }) },
    });
  } catch (error) {
    console.error("❌ updateUserRole:", error);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from here",
      });
    }

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (target.role === "super_admin") {
      const superCount = await User.countDocuments({ role: "super_admin" });
      if (superCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last super admin",
        });
      }
    }

    await Promise.all([
      WasteReport.deleteMany({ reporterId: userId }),
      Transaction.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("❌ deleteUser:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            🏭 FACILITIES                                    */
/* -------------------------------------------------------------------------- */
exports.getFacilities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) {
      filter["location.city"] = new RegExp(
        String(req.query.city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    const facilities = await Facility.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, facilities });
  } catch (error) {
    console.error("❌ getFacilities:", error);
    res.status(500).json({ success: false, message: "Failed to list facilities" });
  }
};

exports.createFacility = async (req, res) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json({ success: true, facility });
  } catch (error) {
    console.error("❌ createFacility:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create facility",
    });
  }
};

exports.updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const facility = await Facility.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found" });
    }
    res.json({ success: true, facility });
  } catch (error) {
    console.error("❌ updateFacility:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update facility",
    });
  }
};

exports.deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const facility = await Facility.findByIdAndDelete(id);
    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found" });
    }
    res.json({ success: true, message: "Facility removed" });
  } catch (error) {
    console.error("❌ deleteFacility:", error);
    res.status(500).json({ success: false, message: "Failed to delete facility" });
  }
};

/* -------------------------------------------------------------------------- */
/*                             📈 ANALYTICS                                    */
/* -------------------------------------------------------------------------- */
exports.getAnalytics = async (req, res) => {
  try {
    const [statusBreakdown, topReporters, cityWise, workerLoads] = await Promise.all([
      WasteReport.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WasteReport.aggregate([
        { $group: { _id: "$reporterId", reportCount: { $sum: 1 } } },
        { $sort: { reportCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            reportCount: 1,
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      ]),
      WasteReport.aggregate([
        { $match: { "location.city": { $exists: true, $ne: "" } } },
        { $group: { _id: "$location.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      WasteReport.aggregate([
        { $match: { assignedTo: { $exists: true, $ne: null } } },
        { $group: { _id: "$assignedTo", assigned: { $sum: 1 } } },
        { $sort: { assigned: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            assigned: 1,
            name: "$user.name",
            email: "$user.email",
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      analytics: {
        statusBreakdown,
        topReporters,
        cityWise,
        workerLoads,
      },
    });
  } catch (error) {
    console.error("❌ getAnalytics:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
};

/* -------------------------------------------------------------------------- */
/*                      📤 EXPORT (JSON / CSV)                                */
/* -------------------------------------------------------------------------- */
function rowsToCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const line = (obj) => keys.map((k) => esc(obj[k])).join(",");
  return [keys.join(","), ...rows.map(line)].join("\r\n");
}

exports.exportData = async (req, res) => {
  try {
    const type = (req.query.type || "users").toLowerCase();
    const format = (req.query.format || "json").toLowerCase();

    let data;
    let filename;

    if (type === "reports") {
      filename = "waste-reports";
      data = await WasteReport.find()
        .populate("reporterId", "name email")
        .populate("assignedTo", "name email")
        .lean();
    } else if (type === "facilities") {
      filename = "facilities";
      data = await Facility.find().lean();
    } else {
      filename = "users";
      data = await User.find()
        .select("-password -refreshToken")
        .lean();
    }

    if (format === "csv") {
      const flat = data.map((doc) => {
        const o = { ...doc };
        if (o._id) o._id = String(o._id);
        if (o.reporterId && typeof o.reporterId === "object") {
          o.reporterName = o.reporterId.name;
          o.reporterEmail = o.reporterId.email;
          delete o.reporterId;
        }
        if (o.assignedTo && typeof o.assignedTo === "object") {
          o.assigneeName = o.assignedTo.name;
          delete o.assignedTo;
        }
        return JSON.parse(JSON.stringify(o));
      });
      const csv = rowsToCsv(flat);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`
      );
      return res.send(csv);
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.json"`
    );
    return res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ exportData:", error);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};

/* -------------------------------------------------------------------------- */
/*                        🚚 ASSIGN REPORT TO WORKER                           */
/* -------------------------------------------------------------------------- */
exports.assignReport = async (req, res) => {
  try {
    const { reportId, workerId } = req.body;
    if (!reportId || !workerId) {
      return res.status(400).json({
        success: false,
        message: "reportId and workerId are required",
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(reportId) ||
      !mongoose.Types.ObjectId.isValid(workerId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ids" });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      return res.status(400).json({
        success: false,
        message: "Invalid worker",
      });
    }

    const report = await WasteReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (!["pending", "assigned"].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: "Report cannot be reassigned in its current status",
      });
    }

    const updated = await WasteReport.assignWorker(
      reportId,
      workerId,
      `Assigned by admin ${req.user.email}`
    );

    res.json({ success: true, report: updated });
  } catch (error) {
    console.error("❌ assignReport:", error);
    res.status(500).json({ success: false, message: "Assignment failed" });
  }
};
