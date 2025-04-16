const db = require('../models/indexModels');
const Conversation = db.Conversation;
const ConversationMember = db.ConversationMember;
const Message = db.Message;
const User = db.User;

// --- [POST] /api/conversations/create ---
exports.createConversation = async (req, res) => {
    try {
        const { name, description, isGroup, memberIds } = req.body;

        // Tạo cuộc trò chuyện mới
        const conversation = await Conversation.create({
            name,
            description,
            isGroup,
            ownerId: req.userId
        });

        // Thêm người tạo vào trước
        await ConversationMember.create({
            conversationId: conversation.id,
            userId: req.userId
        });

        // Nếu là nhóm
        if (isGroup && Array.isArray(memberIds)) {
            const membersToAdd = memberIds
                .filter(id => id !== req.userId)
                .map(userId => ({
                    conversationId: conversation.id,
                    userId
                }));

            if (membersToAdd.length > 0) {
                await ConversationMember.bulkCreate(membersToAdd);
            }

        } else if (!isGroup) {
            // Nếu là tin nhắn riêng: memberIds phải có đúng 1 người
            if (!Array.isArray(memberIds) || memberIds.length !== 1) {
                return res.status(400).json({ error: 'Private conversation must have exactly one recipient' });
            }

            await ConversationMember.create({
                conversationId: conversation.id,
                userId: memberIds[0]
            });
        }

        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [POST] /api/conversations/add-member ---
exports.addMember = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;

        // Kiểm tra cuộc trò chuyện có phải là nhóm không
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation || !conversation.isGroup) {
            return res.status(400).json({ error: 'Can only add members to group conversations' });
        }

        const added = await ConversationMember.create({ conversationId, userId });
        res.status(201).json(added);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/conversations/:conversationId/messages ---
exports.getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.findAll({
            where: { conversationId },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username'] },
                { model: db.File } // nếu có file đính kèm
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            isGroup: conversation.isGroup,
            messages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
