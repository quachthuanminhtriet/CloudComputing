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
db.Conversation = require('./Conversation')(sequelize, DataTypes);
db.ConversationMember = require('./ConversationMember')(sequelize, DataTypes);

// ✅ Define relationships after models are loaded

// User and Messages
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

// User and Files
db.User.hasMany(db.File, { foreignKey: 'uploaderId' });
db.File.belongsTo(db.User, { foreignKey: 'uploaderId' });

// Messages and Files
db.Message.hasMany(db.File, { foreignKey: 'messageId' });
db.File.belongsTo(db.Message, { foreignKey: 'messageId' });

// Conversations and Messages
db.Conversation.hasMany(db.Message, { foreignKey: 'conversationId' });
db.Message.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

// Conversation and User (owner)
db.Conversation.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// Conversation Member and User
db.User.hasMany(db.ConversationMember, { foreignKey: 'userId', as: 'conversationMembers' });
db.ConversationMember.belongsTo(db.User, { foreignKey: 'userId' });
db.ConversationMember.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

// Friendship associations
db.User.hasMany(db.Friendship, { foreignKey: 'requesterId', as: 'sentRequests' });
db.User.hasMany(db.Friendship, { foreignKey: 'addresseeId', as: 'receivedRequests' });

// SearchHistory and User
db.User.hasMany(db.SearchHistory, { foreignKey: 'userId' });

// Notifications and Users
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });       // người nhận
db.Notification.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });   // người gửi

db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' }); // nhận
db.User.hasMany(db.Notification, { foreignKey: 'senderId', as: 'sentNotifications' }); // gửi

module.exports = db;
