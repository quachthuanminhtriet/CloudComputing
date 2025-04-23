const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, friendshipController.getFriends);
router.post('/request', authMiddleware, friendshipController.sendFriendRequest);
router.put('/respond/:id', authMiddleware, friendshipController.acceptFriendRequest);
router.put('/cancel/:id', authMiddleware, friendshipController.cancelFriendRequest);
router.get('/getFriendRequests', authMiddleware, friendshipController.getFriendRequests);

module.exports = router;
