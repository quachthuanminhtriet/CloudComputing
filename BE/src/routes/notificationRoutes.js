const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.post('/', authenticateToken, notificationController.createNotification);
router.get('/', authenticateToken, notificationController.getUserNotifications);
router.patch('/:notificationId/read', authenticateToken, notificationController.markNotificationAsRead);

module.exports = router;