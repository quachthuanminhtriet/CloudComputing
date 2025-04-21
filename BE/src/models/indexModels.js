const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./User')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);
db.ConversationMessage = require('./ConversationMessage')(sequelize, DataTypes);
db.File = require('./File')(sequelize, DataTypes);
db.Friendship = require('./Friendship')(sequelize, DataTypes);
db.SearchHistory = require('./History')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.Conversation = require('./Conversation')(sequelize, DataTypes);
db.ConversationMember = require('./ConversationMember')(sequelize, DataTypes);

// ================= Associations ================= //

// User ↔ Message
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

// User ↔ ConversationMessage
db.User.hasMany(db.ConversationMessage, { foreignKey: 'senderId', as: 'sentConversationMessages' });
db.ConversationMessage.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

// Conversation ↔ ConversationMessage
db.Conversation.hasMany(db.ConversationMessage, { foreignKey: 'conversationId' });
db.ConversationMessage.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

// User ↔ File
db.User.hasMany(db.File, { foreignKey: 'uploaderId' });
db.File.belongsTo(db.User, { foreignKey: 'uploaderId' });

// Message ↔ File
db.Message.hasMany(db.File, { foreignKey: 'messageId' });
db.File.belongsTo(db.Message, { foreignKey: 'messageId' });

// Conversation ↔ Message
db.Conversation.hasMany(db.Message, { foreignKey: 'conversationId' });
db.Message.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

// Conversation ↔ Owner (User)
db.Conversation.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// ConversationMember ↔ User ↔ Conversation
db.User.hasMany(db.ConversationMember, { foreignKey: 'userId', as: 'conversationMembers' });
db.ConversationMember.belongsTo(db.User, { foreignKey: 'userId' });
db.ConversationMember.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

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
