const express = require("express");
const router = express.Router();
const { createConversation, getUserConversations, deleteConversation } = require("../controllers/Conversations");

router.post("/", createConversation);       // Tạo cuộc trò chuyện mới
router.get("/:userId", getUserConversations); // Lấy danh sách cuộc trò chuyện của user
router.delete("/:conversationId", deleteConversation); // Xóa cuộc trò chuyện

module.exports = router;
