// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Get all notifications (paginated)
router.get('/', authenticate, notificationController.getNotifications);

// Mark a single notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark multiple notifications as read
router.patch('/read-multiple', authenticate, notificationController.markMultipleAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// Archive a notification
router.patch('/:id/archive', authenticate, notificationController.archiveNotification);

// Permanently delete a notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
