const db = require('../models/indexModels');
const { Op } = db.Sequelize;

const Message = db.Message;
const Notification = db.Notification;
const User = db.User;

// --- [POST] /api/messages/send ---
exports.sendMessage = async (req, res) => {
    try {
        const { content, receiverId, type } = req.body;
        const senderId = req.user.id;

        console.log('content', req.content);
        console.log('req.receiverId:', req.receiverId);
        if (!receiverId || !content) {
            return res.status(400).json({ error: 'receiverId và content là bắt buộc.' });
        }

        const receiver = await db.User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }

        const message = await Message.create({
            content,
            type: type || 'text',
            senderId,
            receiverId,
            isRead: false
        });

        await Notification.create({
            userId: receiverId,
            message: `Bạn có tin nhắn mới từ ${req.user.username}`,
            type: 'message',
            isRead: false,
            senderId
        });

        res.status(201).json({
            message,
            isGroup: false
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/messages/:receiverId ---
exports.getMessages = async (req, res) => {
    try {
        const receiverId = req.params.receiverId;
        const senderId = req.user.id;

        // Validate receiverId
        if (!receiverId) {
            return res.status(400).json({ error: 'receiverId is required' });
        }

        // Ensure receiverId is a valid number (if IDs are numeric)
        if (isNaN(receiverId)) {
            return res.status(400).json({ error: 'receiverId must be a valid ID' });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'fullName', 'avatarUrl', 'createdAt', 'updatedAt']
                }
            ]
        });

        res.json({
            isGroup: false,
            messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// --- [GET] /api/messages ---
exports.getChattingUsers = async (req, res) => {
    try {
        const senderId = req.user.id;

        // Lấy tất cả tin nhắn mà người dùng đã gửi hoặc nhận
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId },
                    { receiverId: senderId }
                ]
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'fullName', 'avatarUrl']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'fullName', 'avatarUrl']
                }
            ]
        });

        const userMap = new Map();

        messages.forEach(msg => {
            const otherUser = msg.senderId === senderId ? msg.receiver : msg.sender;
            const otherUserId = otherUser.id;

            // Chỉ thêm nếu chưa tồn tại (vì đã sort DESC nên đảm bảo là tin nhắn mới nhất)
            if (!userMap.has(otherUserId)) {
                userMap.set(otherUserId, {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    avatarUrl: otherUser.avatarUrl,
                    lastMessageAt: msg.createdAt,
                    lastMessageContent: msg.content,
                });
            }
        });

        const chattingUsers = Array.from(userMap.values());

        res.json(chattingUsers);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
