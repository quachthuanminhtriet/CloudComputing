const { Conversations, Participants, Users } = require("../models");

// Tạo cuộc trò chuyện mới
const createConversation = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (userIds.length < 2) return res.status(400).json({ message: "Cần ít nhất 2 người để tạo nhóm!" });

    const conversation = await Conversations.create({});
    await Promise.all(userIds.map(userId => Participants.create({ conversationId: conversation.id, userId })));

    res.status(201).json({ message: "Tạo cuộc trò chuyện thành công!", conversation });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Lấy danh sách cuộc trò chuyện của user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Participants.findAll({
      where: { userId },
      include: [{ model: Conversations }],
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem cuộc trò chuyện có tồn tại không
        const conversation = await Conversations.findByPk(id);
        if (!conversation) {
            return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại!" });
        }

        // Xóa các tin nhắn trong cuộc trò chuyện
        await Messages.destroy({ where: { conversationId: id } });

        // Xóa danh sách người tham gia cuộc trò chuyện
        await Participants.destroy({ where: { conversationId: id } });

        // Xóa cuộc trò chuyện
        await conversation.destroy();

        res.json({ message: "Xóa cuộc trò chuyện thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = { createConversation, getUserConversations, deleteConversation };
