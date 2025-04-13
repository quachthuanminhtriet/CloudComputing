const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationCotroller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, conversationController.createConversation);
router.post('/add-member', authMiddleware, conversationController.addMember);
router.get('/:conversationId/messages', authMiddleware, conversationController.getConversationMessages);

module.exports = router;
