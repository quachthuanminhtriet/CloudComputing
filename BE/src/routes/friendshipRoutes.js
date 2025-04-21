const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, friendshipController.getFriends);
router.post('/request', authMiddleware, friendshipController.sendFriendRequest);
router.put('/respond/:id', authMiddleware, friendshipController.acceptFriendRequest);

module.exports = router;
