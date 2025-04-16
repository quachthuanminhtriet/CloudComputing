const db = require('../models/indexModels');
const Message = db.Message;
const Notification = db.Notification;
const Conversation = db.Conversation;
const ConversationMember = db.ConversationMember;
const { Op } = db.Sequelize;

// --- [POST] /api/messages/send ---
exports.sendMessage = async (req, res) => {
    try {
        let { content, receiverId, conversationId, type } = req.body;
        const senderId = req.user.id;

        // Nếu không có conversationId mà có receiverId → Chat 1-1 → kiểm tra & tạo tự động nếu cần
        if (!conversationId && receiverId) {
            const conversations = await Conversation.findAll({
                where: { isGroup: false },
                include: [
                    {
                        model: ConversationMember,
                        where: { userId: [senderId, receiverId] },
                        required: true
                    }
                ]
            });

            // Kiểm tra đúng 2 thành viên
            const matchedConversation = conversations.find(c => {
                const memberIds = c.ConversationMembers.map(m => m.userId);
                return memberIds.includes(senderId) && memberIds.includes(receiverId) && memberIds.length === 2;
            });

            if (matchedConversation) {
                conversationId = matchedConversation.id;
            } else {
                // Tạo mới cuộc trò chuyện 1-1
                const newConvo = await Conversation.create({
                    isGroup: false,
                    name: null,
                    description: null,
                    ownerId: senderId
                });

                await ConversationMember.bulkCreate([
                    { conversationId: newConvo.id, userId: senderId },
                    { conversationId: newConvo.id, userId: receiverId }
                ]);

                conversationId = newConvo.id;
            }
        }

        // Lấy conversation để phân biệt nhóm/1-1
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Tạo tin nhắn
        const message = await Message.create({
            content,
            type,
            senderId,
            receiverId: conversation.isGroup ? null : receiverId, // chỉ set nếu là 1-1
            conversationId,
            isRead: false
        });

        // Tạo thông báo
        if (conversation.isGroup) {
            // → nhóm: tạo thông báo cho tất cả thành viên trừ người gửi
            const members = await ConversationMember.findAll({
                where: {
                    conversationId,
                    userId: { [Op.ne]: senderId }
                }
            });

            const notifications = members.map(m => ({
                userId: m.userId,
                message: `Bạn có tin nhắn mới trong nhóm`,
                type: 'message',
                isRead: false
            }));

            await Notification.bulkCreate(notifications);

        } else {
            // → 1-1: tạo thông báo cho người nhận
            await Notification.create({
                userId: receiverId,
                message: `Bạn có tin nhắn mới từ ${req.user.username}`,
                type: 'message',
                isRead: false
            });
        }

        // ✅ Trả về message
        res.status(201).json({
            message,
            isGroup: conversation.isGroup
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/messages/:conversationId ---
exports.getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const conversation = await db.Conversation.findByPk(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']],
            include: [{
                model: db.User,
                as: 'sender',
                attributes: ['id', 'username']
            }]
        });

        res.json({
            isGroup: conversation.isGroup, // Thêm thông tin về loại cuộc trò chuyện
            messages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
