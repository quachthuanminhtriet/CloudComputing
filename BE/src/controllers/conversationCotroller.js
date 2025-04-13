const db = require('../models/indexModels');
const Conversation = db.Conversation;
const ConversationMember = db.ConversationMember;

exports.createConversation = async (req, res) => {
    try {
        const { name, description } = req.body;
        const conversation = await Conversation.create({ name, description, ownerId: req.userId });
        await ConversationMember.create({ conversationId: conversation.id, userId: req.userId });
        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        const added = await ConversationMember.create({ conversationId, userId });
        res.status(201).json(added);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await db.Message.findAll({
            where: { conversationId },
            include: [
                { model: db.User, as: 'sender', attributes: ['id', 'username'] },
                { model: db.File }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
