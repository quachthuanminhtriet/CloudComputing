const db = require('../models/indexModels');
const Message = db.Message;
const Notification = db.Notification;

exports.sendMessage = async (req, res) => {
    try {
        const { content, receiverId, conversationId, type } = req.body;
        const message = await Message.create({
            content,
            type,
            senderId: req.user.id,
            receiverId,
            conversationId
        });

        await Notification.create({
            userId: receiverId,
            message: `Bạn có tin nhắn mới từ ${req.user.username}`,
            type: 'message',
            isRead: false
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { conversationId: req.params.id },
            order: [['createdAt', 'ASC']],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};