module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        content: { type: DataTypes.TEXT },
        fileUrl: { type: DataTypes.STRING },
        type: { type: DataTypes.ENUM("text", "image", "video", "file", "audio"), defaultValue: "text" },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        senderId: { type: DataTypes.INTEGER, allowNull: false },
        receiverId: { type: DataTypes.INTEGER, allowNull: false },
    });

    return Message;
};
