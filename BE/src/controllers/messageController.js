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
                    attributes: ['id', 'fullName', 'avatarUrl']
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
                    { senderId: senderId },
                    { receiverId: senderId }
                ]
            },
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

        // Tạo một Set để lưu trữ các ID người dùng duy nhất đã liên lạc
        const chattingUserIds = new Set();

        messages.forEach(msg => {
            if (msg.senderId !== senderId) {
                chattingUserIds.add(msg.senderId);
            }
            if (msg.receiverId !== senderId) {
                chattingUserIds.add(msg.receiverId);
            }
        });

        // Chuyển Set thành một mảng các ID
        const userIds = Array.from(chattingUserIds);

        // Lấy thông tin chi tiết của những người dùng đã liên lạc
        const chattingUsers = await User.findAll({
            where: {
                id: {
                    [Op.in]: userIds
                }
            },
            attributes: ['id', 'fullName', 'avatarUrl']
        });

        res.json(chattingUsers);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};