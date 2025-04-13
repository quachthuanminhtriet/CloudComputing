const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/:notificationId/read', authMiddleware, notificationController.markAsRead);

module.exports = router;