const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const fileController = require('../controllers/fileController');
const authenticateToken = require('../middleware/authMiddleware');  // Middleware xác thực token

// Đường dẫn gửi tin nhắn
router.post('/messages/send', authenticateToken, messageController.sendMessage);

// Đường dẫn lấy tin nhắn
router.get('/messages/:id', authenticateToken, messageController.getMessages);

// Đường dẫn tải file lên
router.post('/messages/uploadFile', authenticateToken, fileController.uploadFile);

// Đường dẫn tải file về
router.get('/messages/download/:filename', fileController.downloadFile);

module.exports = router;
