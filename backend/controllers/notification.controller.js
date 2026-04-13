/* =============================================================================
 * Notifications Controller (In-app)
 * =============================================================================
 * Purpose:
 *   Provide CRUD-like endpoints for user notifications:
 *   - List notifications (paginated, optional unread-only filtering)
 *   - Mark single/multiple/all notifications as read
 *   - Archive notifications (soft delete)
 *   - Delete notifications (hard delete)
 *
 * Exports:
 *   - getNotifications
 *   - markAsRead
 *   - markMultipleAsRead
 *   - markAllAsRead
 *   - archiveNotification
 *   - deleteNotification
 * ============================================================================= */
const Notification = require('../models/Notification');

/**
 * Get paginated notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly, sort = '-createdAt' } = req.query;

    const filter = { userId: req.user._id, archived: false };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, isRead: false })
    ]);

    res.json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('GET /notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('PATCH /notifications/:id/read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

/**
 * Mark multiple notifications as read
 */
exports.markMultipleAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Notification IDs required' });
    }

    await Notification.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({ success: true, message: `${ids.length} notifications marked as read` });
  } catch (error) {
    console.error('PATCH /notifications/read-multiple error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark multiple notifications' });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('PATCH /notifications/read-all error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

/**
 * Archive a notification (soft delete)
 */
exports.archiveNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { archived: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification archived successfully' });
  } catch (error) {
    console.error('PATCH /notifications/:id/archive error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive notification' });
  }
};

/**
 * Permanently delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('DELETE /notifications/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
