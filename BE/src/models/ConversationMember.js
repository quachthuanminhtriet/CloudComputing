module.exports = (sequelize, DataTypes) => {
    const ConversationMember = sequelize.define("ConversationMember", {
        joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    return ConversationMember;
};
