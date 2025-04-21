const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const fileController = require('../controllers/fileController');
const authenticateToken = require('../middleware/authMiddleware');  // Middleware xác thực token

// Đường dẫn gửi tin nhắn
router.post('/send', authenticateToken, messageController.sendMessage);

// Đường dẫn lấy tin nhắn
router.get('/:receiverId', authenticateToken, messageController.getMessages);

router.get('/', authenticateToken, messageController.getChattingUsers);

// Đường dẫn tải file lên
router.post('/uploadFile', authenticateToken, fileController.uploadFile);

// Đường dẫn tải file về
router.get('/downloadFile/:id', authenticateToken, fileController.downloadFile);

module.exports = router;
