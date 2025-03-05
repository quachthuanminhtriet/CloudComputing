const sequelize = require('../configs/database');
const Users = require('./users'); // Import model Users

// Đồng bộ model với database (tạo bảng nếu chưa có)
const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // `alter: true` giúp cập nhật bảng mà không mất dữ liệu
        console.log("✅ Database & tables synchronized!");
    } catch (error) {
        console.error("❌ Lỗi đồng bộ database:", error);
    }
};

syncDB(); // Gọi hàm đồng bộ database

module.exports = { Users };
