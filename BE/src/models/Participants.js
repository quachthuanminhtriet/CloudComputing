const { DataTypes } = require("sequelize");
const sequelize = require("../configs/database");

const Participant = sequelize.define("Participant", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "member" }, // member, admin
}, { timestamps: true });

module.exports = Participant;
