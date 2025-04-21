module.exports = (sequelize, DataTypes) => {
    const ConversationMessage = sequelize.define('ConversationMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: true // chỉ dùng khi là chat 1-1
        },
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'ConversationMessages',
        timestamps: true // để tự tạo createdAt / updatedAt
    });

    return ConversationMessage;
};
