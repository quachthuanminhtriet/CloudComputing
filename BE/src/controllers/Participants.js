const { Participants, Users, Conversations } = require("../models");

// Thêm thành viên vào cuộc trò chuyện
const addParticipant = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    // Kiểm tra cuộc trò chuyện có tồn tại không
    const conversation = await Conversations.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại!" });

    // Kiểm tra user có tồn tại không
    const user = await Users.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại!" });

    // Kiểm tra user đã có trong cuộc trò chuyện chưa
    const existingParticipant = await Participants.findOne({ where: { conversationId, userId } });
    if (existingParticipant) return res.status(400).json({ message: "User đã ở trong cuộc trò chuyện!" });

    // Thêm user vào cuộc trò chuyện
    const participant = await Participants.create({ conversationId, userId });

    res.status(201).json({ message: "Đã thêm thành viên!", participant });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Xóa thành viên khỏi cuộc trò chuyện
const removeParticipant = async (req, res) => {
  try {
    const { conversationId, userId } = req.params;

    // Kiểm tra user có trong cuộc trò chuyện không
    const participant = await Participants.findOne({ where: { conversationId, userId } });
    if (!participant) return res.status(404).json({ message: "User không có trong cuộc trò chuyện!" });

    // Xóa user khỏi cuộc trò chuyện
    await participant.destroy();

    res.json({ message: "Đã xóa thành viên khỏi cuộc trò chuyện!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Lấy danh sách thành viên của cuộc trò chuyện
const getParticipants = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Kiểm tra cuộc trò chuyện có tồn tại không
    const conversation = await Conversations.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại!" });

    // Lấy danh sách thành viên
    const participants = await Participants.findAll({
      where: { conversationId },
      include: [{ model: Users, attributes: ["id", "username", "fullname", "avatar"] }],
    });

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

module.exports = { addParticipant, removeParticipant, getParticipants };
