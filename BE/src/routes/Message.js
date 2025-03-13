const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, deleteMessage } = require("../controllers/Message");

router.post("/", sendMessage);          // Gửi tin nhắn
router.get("/:conversationId", getMessages); // Lấy danh sách tin nhắn trong cuộc trò chuyện
router.delete("/:messageId", deleteMessage); // Xóa tin nhắn

module.exports = router;
