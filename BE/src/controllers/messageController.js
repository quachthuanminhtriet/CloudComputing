const db = require('../models/indexModels');
const Message = db.Message;
const Notification = db.Notification;

// --- [POST] /api/messages/send ---
exports.sendMessage = async (req, res) => {
    try {
        const { content, receiverId, conversationId, type } = req.body;

        const message = await Message.create({
            content,
            type,
            senderId: req.user.id,
            receiverId,
            conversationId,
            isRead: false
        });

        // Tạo thông báo cho người nhận
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

// --- [GET] /api/messages/:conversationId ---
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { conversationId: req.params.id },
            order: [['createdAt', 'ASC']],
            include: [{
                model: db.User,
                as: 'sender',
                attributes: ['id', 'username'] // Bao gồm thông tin người gửi
            }]
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
