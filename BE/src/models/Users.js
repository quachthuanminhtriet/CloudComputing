const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Users = sequelize.define('Users', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullname: { type: DataTypes.STRING, allowNull: false},
    mail: { type: DataTypes.STRING, allowNull: false, unique: true},
    avatar: { type: DataTypes.STRING, allowNull: true}, // Link ảnh đại diện
    status: { type: DataTypes.STRING, defaultValue: "online" }, // online, offline
}, {
    timestamps: true // tạo tự động create và update time
});

module.exports = Users;
