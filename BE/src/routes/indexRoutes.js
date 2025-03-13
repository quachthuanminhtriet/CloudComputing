const express = require("express");
const router = express.Router();

const userRoutes = require("./Users");
const conversationRoutes = require("./Conversations");
const messageRoutes = require("./Message");
const participantRoutes = require("./Participants");
const notificationRoutes = require("./Notifications");

router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/participants", participantRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
