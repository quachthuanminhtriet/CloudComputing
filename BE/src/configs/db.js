require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || process.env.DB_NAME_RAILWAY,
    process.env.DB_USER,
    process.env.DB_PASSWORD || process.env.DB_PASSWORD_RAILWAY,
    {
        host: process.env.DB_HOST || process.env.DB_HOST_RAILWAY,
        dialect: 'mysql',
        logging: false,
        define: {
            freezeTableName: true,
            timestamps: true
        }
    }
);

module.exports = sequelize;
