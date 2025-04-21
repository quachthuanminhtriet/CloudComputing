const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationCotroller'); // sửa tên file
const authMiddleware = require('../middleware/authMiddleware');

// Tạo mới cuộc trò chuyện (1-1 hoặc nhóm)
router.post('/', authMiddleware, conversationController.createConversation);

// Lấy danh sách tin nhắn trong cuộc trò chuyện
router.get('/:conversationId/messages', authMiddleware, conversationController.getConversationMessages);

module.exports = router;
