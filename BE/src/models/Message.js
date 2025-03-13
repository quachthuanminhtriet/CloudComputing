const { DataTypes } = require("sequelize");
const sequelize = require("../configs/database");

const Message = sequelize.define("Message", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true }, // Nội dung tin nhắn
    type: { type: DataTypes.STRING, defaultValue: "text" }, // text, image, file
    fileUrl: { type: DataTypes.STRING, allowNull: true }, // Link file (nếu có)
}, { timestamps: true });

module.exports = Message;
