const { Messages, Conversations, Participants } = require("../models");

// Gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;

    const isParticipant = await Participants.findOne({ where: { conversationId, userId: senderId } });
    if (!isParticipant) return res.status(403).json({ message: "Bạn không thuộc cuộc trò chuyện này!" });

    const message = await Messages.create({ conversationId, senderId, content });

    res.status(201).json({ message: "Tin nhắn đã được gửi!", message });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Lấy danh sách tin nhắn trong cuộc trò chuyện
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Messages.findAll({ where: { conversationId } });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Messages.findByPk(id);
        if (!message) return res.status(404).json({ message: "Tin nhắn không tồn tại!" });

        await message.destroy();
        res.json({ message: "Xóa tin nhắn thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = { sendMessage, getMessages, deleteMessage };