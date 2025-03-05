require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./configs/database');
const userRoutes = require('./routes/Users');
const { Users } = require('./models'); // Import model từ models/index.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);

// Kiểm tra kết nối MySQL và đồng bộ database
const startServer = async () => {
    try {
        await sequelize.authenticate(); // Kiểm tra kết nối MySQL
        console.log("✅ Kết nối MySQL thành công!");

        await sequelize.sync({ alter: true }); // Đồng bộ model với database
        console.log("✅ Database đã được đồng bộ!");

        app.listen(PORT, () => {
            console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Lỗi kết nối MySQL:", error);
    }
};

// Chạy server
startServer();
