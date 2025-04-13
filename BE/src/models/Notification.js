module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
        type: { type: DataTypes.ENUM("message", "friend_request", "system") },
        content: { type: DataTypes.STRING },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
    });

    return Notification;
};
