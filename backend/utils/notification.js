// utils/notification.js
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./email");
const { sendSMS } = require("./sms");

/* -------------------------------------------------------------------------- */
/*                    VALID NOTIFICATION TYPES & PRIORITIES                  */
/* -------------------------------------------------------------------------- */
const VALID_TYPES = [
  "system",
  "report-update",
  "assignment",
  "payment",
  "achievement",
  "alert",
  "reward",
];

const VALID_PRIORITIES = ["low", "normal", "high", "critical"];
const VALID_CHANNELS = ["in-app", "email", "sms", "all"];

/* -------------------------------------------------------------------------- */
/*                     🚀 CREATE SINGLE USER NOTIFICATION                     */
/* -------------------------------------------------------------------------- */
exports.createNotification = async (userId, data) => {
  try {
    if (!userId || !data?.title || !data?.message) {
      throw new Error("Invalid notification input");
    }

    // 🔒 Sanitize incoming data
    const notificationData = {
      userId,
      title: String(data.title).trim(),
      message: String(data.message).trim(),
      type: VALID_TYPES.includes(data.type) ? data.type : "system",
      link: data.link || null,
      priority: VALID_PRIORITIES.includes(data.priority)
        ? data.priority
        : "normal",
      channel: VALID_CHANNELS.includes(data.channel) ? data.channel : "in-app",
      metadata: data.metadata || {},
      isRead: false,
    };

    // 💾 Save in database
    const notification = await Notification.create(notificationData);

    /* ---------------------------------------------------------------------- */
    /*            🔥 BACKGROUND DELIVERY (Email / SMS) - NON BLOCKING         */
    /* ---------------------------------------------------------------------- */

    setImmediate(async () => {
      try {
        const user = await User.findById(userId).select("email phone name");

        if (!user) return;

        const shouldNotify =
          notification.priority === "high" ||
          notification.priority === "critical";

        if (!shouldNotify) return;

        /* -------------------------- EMAIL SEND -------------------------- */
        if (
          (notification.channel === "email" ||
            notification.channel === "all") &&
          user.email
        ) {
          const frontendURL = process.env.FRONTEND_URL || "";
          const link = notification.link
            ? `${frontendURL}${notification.link}`
            : "";

          await sendEmail(
            user.email,
            `EcoTrack: ${notification.title}`,
            `${notification.message}\n\n${link}`
          );
        }

        /* ---------------------------- SMS SEND --------------------------- */
        if (
          (notification.channel === "sms" || notification.channel === "all") &&
          user.phone
        ) {
          await sendSMS(
            user.phone,
            `${notification.title}: ${notification.message}`
          );
        }
      } catch (bgErr) {
        console.warn("⚠  Background notification error:", bgErr.message);
      }
    });

    return notification;
  } catch (error) {
    console.error("❌ Notification error:", error.message);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                   🚀 SEND BULK NOTIFICATIONS TO MANY USERS                */
/* -------------------------------------------------------------------------- */
exports.sendBulkNotifications = async (userIds, data) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("User IDs list is empty");
    }

    const sanitized = {
      title: data.title?.trim(),
      message: data.message?.trim(),
      type: VALID_TYPES.includes(data.type) ? data.type : "system",
      link: data.link || null,
      priority: VALID_PRIORITIES.includes(data.priority)
        ? data.priority
        : "normal",
      channel: VALID_CHANNELS.includes(data.channel) ? data.channel : "in-app",
      metadata: data.metadata || {},
      isRead: false,
    };

    const notifications = userIds.map((userId) => ({
      userId,
      ...sanitized,
    }));

    await Notification.insertMany(notifications, { ordered: false });

    /* ---------------------------------------------------------------------- */
    /*                    BACKGROUND BULK DELIVERY (Email/SMS)                */
    /* ---------------------------------------------------------------------- */
    if (["high", "critical"].includes(sanitized.priority)) {
      setImmediate(async () => {
        try {
          const users = await User.find({ _id: { $in: userIds } }).select(
            "email phone"
          );

          for (const user of users) {
            if (
              user.email &&
              (sanitized.channel === "email" || sanitized.channel === "all")
            ) {
              await sendEmail(user.email, sanitized.title, sanitized.message);
            }

            if (
              user.phone &&
              (sanitized.channel === "sms" || sanitized.channel === "all")
            ) {
              await sendSMS(
                user.phone,
                `${sanitized.title}: ${sanitized.message}`
              );
            }
          }
        } catch (bgErr) {
          console.warn("⚠ Bulk notification background error:", bgErr.message);
        }
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Bulk notification error:", error.message);
    return false;
  }
};
