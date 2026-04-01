// controllers/worker.controller.js
const WasteReport = require('../models/WasteReport');
const User = require('../models/User');
const { createNotification } = require('../utils/notification');

/* -------------------------------------------------------------------------- */
/*                           📋 GET ASSIGNED REPORTS                           */
/* -------------------------------------------------------------------------- */
exports.getAssignedReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const reports = await WasteReport.find(filter)
      .populate('reporterId', 'name email phone avatar')
      .sort('-assignedAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * limit);

    const count = await WasteReport.countDocuments(filter);

    res.json({
      success: true,
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error('❌ getAssignedReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned reports' });
  }
};

/* -------------------------------------------------------------------------- */
/*                          ⚙️ UPDATE REPORT STATUS                           */
/* -------------------------------------------------------------------------- */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, note, verificationPhoto } = req.body;

    // Validate worker permission
    const report = await WasteReport.findOne({
      _id: req.params.id,
      assignedTo: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or not assigned to you'
      });
    }

    // Prevent invalid status transitions
    const allowedStatuses = ['assigned', 'in-progress', 'collected', 'processed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update'
      });
    }

    // Update report timeline
    report.status = status;
    report.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    /* ----------------------- Notify User Based on Status ---------------------- */
    if (status === 'in-progress') {
      await createNotification(report.reporterId, {
        title: 'Collection Started',
        message: 'A waste collector is on the way to collect your waste.',
        type: 'report-update',
        link: `/reports/${report._id}`
      });
    }

    if (status === 'collected') {
      report.collectedAt = new Date();
      if (verificationPhoto) report.verificationPhoto = verificationPhoto;

      // Update worker stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { collectionsCount: 1 }
      });

      await createNotification(report.reporterId, {
        title: 'Waste Collected',
        message: 'Your waste report has been successfully collected.',
        type: 'report-update',
        priority: 'high',
        link: `/reports/${report._id}`
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error('❌ updateReportStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
};

/* -------------------------------------------------------------------------- */
/*                              📊 GET WORKER STATS                            */
/* -------------------------------------------------------------------------- */
exports.getWorkStats = async (req, res) => {
  try {
    const workerId = req.user._id;

    const [totalAssigned, totalCompleted, inProgress, pending] = await Promise.all([
      WasteReport.countDocuments({ assignedTo: workerId }),
      WasteReport.countDocuments({ assignedTo: workerId, status: 'collected' }),
      WasteReport.countDocuments({ assignedTo: workerId, status: 'in-progress' }),
      WasteReport.countDocuments({ assignedTo: workerId, status: 'assigned' })
    ]);

    // Today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollections = await WasteReport.countDocuments({
      assignedTo: workerId,
      collectedAt: { $gte: today }
    });

    // Average rating
    const ratedReports = await WasteReport.find({
      assignedTo: workerId,
      rating: { $exists: true }
    });

    const avgRating =
      ratedReports.length > 0
        ? ratedReports.reduce((sum, r) => sum + r.rating, 0) / ratedReports.length
        : 0;

    res.json({
      success: true,
      stats: {
        totalAssigned,
        totalCompleted,
        inProgress,
        pending,
        todayCollections,
        avgRating: avgRating.toFixed(1),
        completionRate:
          totalAssigned > 0
            ? ((totalCompleted / totalAssigned) * 100).toFixed(1)
            : 0
      }
    });
  } catch (error) {
    console.error('❌ getWorkStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch worker stats' });
  }
};

/* -------------------------------------------------------------------------- */
/*                           📅 GET DAILY WORK SCHEDULE                        */
/* -------------------------------------------------------------------------- */
exports.getSchedule = async (req, res) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedule = await WasteReport.find({
      assignedTo: req.user._id,
      status: { $in: ['assigned', 'in-progress'] },
      assignedAt: { $gte: targetDate, $lt: nextDay }
    })
      .populate('reporterId', 'name phone location')
      .sort('assignedAt');

    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      schedule
    });
  } catch (error) {
    console.error('❌ getSchedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule' });
  }
};
