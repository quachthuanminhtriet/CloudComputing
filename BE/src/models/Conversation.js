module.exports = (sequelize, DataTypes) => {
    const Conversation = sequelize.define("Conversation", {
        name: { type: DataTypes.STRING },
        isGroup: { type: DataTypes.BOOLEAN, defaultValue: false }
    });

    return Conversation;
};
