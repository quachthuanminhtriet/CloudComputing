const { DataTypes } = require("sequelize");
const sequelize = require("../configs/database");

const Notification = sequelize.define("Notification", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // Người nhận thông báo
    type: { type: DataTypes.STRING, allowNull: false }, // Loại thông báo (message, system, friend_request...)
    content: { type: DataTypes.TEXT, allowNull: false }, // Nội dung thông báo
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false }, // Trạng thái đã đọc
}, {
    timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = Notification;
