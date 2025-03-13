const { Notifications } = require("../models");

// Gửi thông báo
const sendNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    const notification = await Notifications.create({ userId, type, message });

    res.status(201).json({ message: "Thông báo đã được gửi!", notification });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Lấy danh sách thông báo của user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notifications.findAll({ where: { userId } });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Đánh dấu thông báo là đã đọc
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notifications.findByPk(notificationId);
        if (!notification) return res.status(404).json({ message: "Thông báo không tồn tại!" });

        await notification.update({ isRead: true });

        res.json({ message: "Thông báo đã được đánh dấu là đã đọc!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


module.exports = { sendNotification, getUserNotifications, markAsRead };
