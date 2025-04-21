    const db = require('../models/indexModels');
    const Message = db.Message;
    const Notification = db.Notification;
    const { Op } = db.Sequelize;

    // --- [POST] /api/messages/send ---
    exports.sendMessage = async (req, res) => {
        try {
            let { content, receiverId, type } = req.body;
            const senderId = req.user.id;

            // Tạo tin nhắn
            const message = await Message.create({
                content,
                type,
                senderId,
                receiverId,
                isRead: false
            });

            // Tạo thông báo cho người nhận
            await Notification.create({
                userId: receiverId,
                message: `Bạn có tin nhắn mới từ ${req.user.username}`,
                type: 'message',    
                isRead: false,
                senderId: req.user.id,
            });

            // Trả về message
            res.status(201).json({
                message,
                isGroup: false // Vì đây là tin nhắn 1-1
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    };

    // --- [GET] /api/messages/:receiverId ---
    exports.getMessages = async (req, res) => {
        try {
            const { id: receiverId } = req.params;
            const senderId = req.user.id;

            // Lấy tất cả tin nhắn giữa senderId và receiverId
            const messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                },
                order: [['createdAt', 'ASC']],
                include: [{
                    model: db.User,
                    as: 'sender',
                    attributes: ['id', 'username']
                }]
            });

            res.json({
                isGroup: false, // Đây là tin nhắn 1-1
                messages
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
