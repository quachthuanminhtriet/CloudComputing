const express = require("express");
const router = express.Router();
const { sendNotification, getUserNotifications, markAsRead } = require("../controllers/Notifications");

router.post("/", sendNotification);    // Gửi thông báo
router.get("/:userId", getUserNotifications); // Lấy danh sách thông báo của user
router.put("/:notificationId/read", markAsRead); // Đánh dấu thông báo đã đọc

module.exports = router;
