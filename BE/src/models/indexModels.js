const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./User')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);
db.File = require('./File')(sequelize, DataTypes);
db.Friendship = require('./Friendship')(sequelize, DataTypes);
db.SearchHistory = require('./History')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);

// ================= Associations ================= //

// User ↔ Message
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
db.User.hasMany(db.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Message.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

// User ↔ File
db.User.hasMany(db.File, { foreignKey: 'uploaderId' });
db.File.belongsTo(db.User, { foreignKey: 'uploaderId' });

// Message ↔ File
db.Message.hasOne(db.File, { foreignKey: 'messageId', as: 'fileData' });
db.File.belongsTo(db.Message, { foreignKey: 'messageId' });

// Friendship (Friend Request)
db.User.hasMany(db.Friendship, { foreignKey: 'requesterId', as: 'sentRequests' });
db.User.hasMany(db.Friendship, { foreignKey: 'addresseeId', as: 'receivedRequests' });

db.Friendship.belongsTo(db.User, { foreignKey: 'requesterId', as: 'requester' });
db.Friendship.belongsTo(db.User, { foreignKey: 'addresseeId', as: 'addressee' });

// SearchHistory ↔ User
db.User.hasMany(db.SearchHistory, { foreignKey: 'userId' });

// Notification (sender/receiver)
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });       // Người nhận
db.Notification.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });   // Người gửi

db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' });
db.User.hasMany(db.Notification, { foreignKey: 'senderId', as: 'sentNotifications' });

module.exports = db;
