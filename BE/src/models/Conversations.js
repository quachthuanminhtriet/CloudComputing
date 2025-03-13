const { DataTypes } = require("sequelize");
const sequelize = require("../configs/database");

const Conversation = sequelize.define("Conversation", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    isGroup: { type: DataTypes.BOOLEAN, defaultValue: false }, // false = chat 1-1
    name: { type: DataTypes.STRING, allowNull: true }, // Tên nhóm (chỉ dùng khi là group)
    creatorId: { type: DataTypes.INTEGER, allowNull: false }, // Người tạo nhóm
}, { timestamps: true });

module.exports = Conversation;
