// controllers/waste.controller.js
const WasteReport = require("../models/WasteReport");
const Facility = require("../models/Facility");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { classifyWaste } = require("../utils/ai");
const { createNotification } = require("../utils/notification");

/* -------------------------------------------------------------------------- */
/*                           CREATE WASTE REPORT                              */
/* -------------------------------------------------------------------------- */
exports.createReport = async (req, res) => {
  try {
    const { wasteType, quantity, description } = req.body;
    let { location } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    /* ------------------------------------------
       LOCATION VALIDATION
    ------------------------------------------- */
    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    try {
      location = typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format. Must be valid JSON.",
      });
    }

    if (
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordinates must be [longitude, latitude]",
      });
    }

    /* ------------------------------------------
       AI PREDICTION (Used for analytics only)
    ------------------------------------------- */
    let aiPrediction = null;
    try {
      if (images.length > 0) {
        aiPrediction = await classifyWaste(images[0]);
      }
    } catch (err) {
      console.warn("⚠️ AI prediction failed:", err.message);
    }

    /* ------------------------------------------
       CREATE REPORT (preserve user waste type)
    ------------------------------------------- */
    const report = await WasteReport.create({
      reporterId: req.user._id,
      wasteType: wasteType?.toLowerCase().trim(), // IMPORTANT FIX
      quantity,
      description,
      images,

      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address || "",
        city: location.city || "",
        state: location.state || "",
        landmark: location.landmark || "",
      },

      aiPrediction,

      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Report created successfully",
          updatedBy: req.user._id,
        },
      ],
    });

    /* ------------------------------------------
       ECO POINTS
    ------------------------------------------- */
    const pointsMap = { small: 10, medium: 20, large: 30 };
    const ecoPoints = pointsMap[quantity] || 10;

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, {
        $inc: { ecoPoints, reportsCount: 1 },
      }),

      Transaction.create({
        userId: req.user._id,
        type: "eco-points-earned",
        amount: 0, // REQUIRED by schema
        ecoPoints,
        description: "Eco points earned for waste report submission",
        relatedReport: report._id,
        status: "completed",
      }),

      createNotification(req.user._id, {
        title: "Report Submitted",
        message: `Your waste report has been submitted successfully. You earned ${ecoPoints} eco points!`,
        type: "report-update",
        link: `/reports/${report._id}`,
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Waste report created successfully",
      report,
      ecoPointsAwarded: ecoPoints,
    });
  } catch (error) {
    console.error("❌ createReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           GET ALL REPORTS                                  */
/* -------------------------------------------------------------------------- */
exports.getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = "-createdAt" } = req.query;

    const filter = {};

    // User = own reports only
    if (req.user.role === "user") {
      filter.reporterId = req.user._id;
    }

    // Worker = assigned + pending
    else if (req.user.role === "worker") {
      filter.$or = [{ assignedTo: req.user._id }, { status: "pending" }];
    }

    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      WasteReport.find(filter)
        .populate("reporterId", "name email avatar")
        .populate("assignedTo", "name phone workerId")
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),

      WasteReport.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      reports,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("❌ getReports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           GET REPORT BY ID                                 */
/* -------------------------------------------------------------------------- */
exports.getReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate("reporterId", "name email avatar phone")
      .populate("assignedTo", "name phone workerId")
      .populate("timeline.updatedBy", "name role");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({ success: true, report });
  } catch (error) {
    console.error("❌ getReportById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report details",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           UPDATE REPORT                                    */
/* -------------------------------------------------------------------------- */
exports.updateReport = async (req, res) => {
  try {
    const { status, assignedTo, verificationPhoto, rating } = req.body;

    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // User can update only own report
    if (
      req.user.role === "user" &&
      report.reporterId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ------------------------ STATUS LOGIC ------------------------ */
    if (status) {
      report.status = status;

      report.timeline.push({
        status,
        timestamp: new Date(),
        note: `Status updated to ${status}`,
        updatedBy: req.user._id,
      });

      // Assigned
      if (status === "assigned" && assignedTo) {
        report.assignedTo = assignedTo;
        report.assignedAt = new Date();

        await createNotification(assignedTo, {
          title: "New Task Assigned",
          message: "You have been assigned a waste collection task.",
          type: "assignment",
          link: `/worker/reports/${report._id}`,
        });
      }

      // Collected
      if (status === "collected") {
        report.collectedAt = new Date();
        if (verificationPhoto) report.verificationPhoto = verificationPhoto;

        await Promise.all([
          User.findByIdAndUpdate(report.assignedTo, {
            $inc: { collectionsCount: 1 },
          }),
          createNotification(report.reporterId, {
            title: "Waste Collected",
            message: "Your waste report has been collected successfully.",
            type: "report-update",
            link: `/reports/${report._id}`,
          }),
        ]);
      }

      // Processed
      if (status === "processed") {
        report.processedAt = new Date();
      }
    }

    if (rating) report.rating = rating;

    await report.save();

    return res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("❌ updateReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           DELETE REPORT                                    */
/* -------------------------------------------------------------------------- */
exports.deleteReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Only owner or admin can delete
    if (
      report.reporterId.toString() !== req.user._id.toString() &&
      !["admin", "super_admin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reports can be deleted",
      });
    }

    await report.deleteOne();

    return res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           NEARBY FACILITIES                                */
/* -------------------------------------------------------------------------- */
exports.getNearbyFacilities = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Coordinates required",
      });
    }

    const facilities = await Facility.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: "active",
    }).limit(10);

    return res.json({
      success: true,
      facilities,
    });
  } catch (error) {
    console.error("❌ getNearbyFacilities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch facilities",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           RATE COLLECTION                                  */
/* -------------------------------------------------------------------------- */
exports.rateCollection = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!["collected", "processed"].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: "Rating allowed only after collection or processing",
      });
    }

    report.rating = rating;

    if (feedback) {
      report.timeline.push({
        status: report.status,
        timestamp: new Date(),
        note: `Rating: ${rating}/5 - ${feedback}`,
        updatedBy: req.user._id,
      });
    }

    await report.save();

    return res.json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.error("❌ rateCollection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit rating",
    });
  }
};
