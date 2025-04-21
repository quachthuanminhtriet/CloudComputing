const db = require('../models/indexModels');
const Conversation = db.Conversation;
const ConversationMember = db.ConversationMember;
const ConversationMessage = db.ConversationMessage; // thay Message
const User = db.User;

// --- [POST] /api/conversations/create ---
exports.createConversation = async (req, res) => {
    try {
        const { name, description, isGroup, memberIds } = req.body;
        const creatorId = req.userId;

        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ error: 'Member list is required' });
        }

        // Nếu là chat 1-1
        if (!isGroup) {
            if (memberIds.length !== 1) {
                return res.status(400).json({ error: 'Private conversation must have exactly one recipient' });
            }

            const receiverId = memberIds[0];

            // Kiểm tra nếu đã có 1-1 conversation giữa hai người này
            const existing = await Conversation.findAll({
                where: { isGroup: false },
                include: [{
                    model: ConversationMember,
                    where: { userId: [creatorId, receiverId] },
                    required: true
                }]
            });

            const match = existing.find(conv => {
                const memberIds = conv.ConversationMembers.map(m => m.userId);
                return memberIds.includes(creatorId) && memberIds.includes(receiverId) && memberIds.length === 2;
            });

            if (match) {
                return res.status(200).json(match); // trả về conv cũ
            }
        }

        // Tạo cuộc trò chuyện mới
        const conversation = await Conversation.create({
            name,
            description,
            isGroup,
            ownerId: creatorId
        });

        // Thêm người tạo
        await ConversationMember.create({
            conversationId: conversation.id,
            userId: creatorId
        });

        // Thêm thành viên còn lại
        const membersToAdd = memberIds
            .filter(id => id !== creatorId)
            .map(userId => ({ conversationId: conversation.id, userId }));

        if (membersToAdd.length > 0) {
            await ConversationMember.bulkCreate(membersToAdd);
        }

        res.status(201).json(conversation);
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

        const messages = await ConversationMessage.findAll({
            where: { conversationId },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username'] },
                { model: db.File }
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
