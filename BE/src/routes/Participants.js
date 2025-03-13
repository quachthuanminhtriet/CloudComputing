const express = require("express");
const router = express.Router();
const { addParticipant, removeParticipant, getParticipants } = require("../controllers/Participants");

router.post("/add", addParticipant);  // Thêm thành viên vào cuộc trò chuyện
router.delete("/:id/:userId", removeParticipant); // Xóa thành viên khỏi cuộc trò chuyện
router.get("/:conversationId", getParticipants); // Lấy danh sách thành viên của cuộc trò chuyện

module.exports = router;
