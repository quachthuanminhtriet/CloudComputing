const jwt = require('jsonwebtoken');
const db = require('../models/indexModels');

const authenticateToken = (req, res, next) => {
    // Lấy token từ Authorization header
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Không có token' });
    }

    console.log("Token: ", token);

    // Giải mã token để lấy thông tin người dùng
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log("JWT Verify Error: ", err);
            return res.status(403).json({ error: 'Token không hợp lệ' });
        }

        // In ra thông tin giải mã để kiểm tra
        console.log("Decoded token:", decoded);

        // Kiểm tra xem có trường `userId` trong payload không (hoặc `id` tùy thuộc cách bạn tạo token)
        const userId = decoded.userId || decoded.id;  // Nếu bạn sử dụng `userId` trong payload, dùng `decoded.userId`
        if (!userId) {
            return res.status(400).json({ error: 'Không có userId trong token' });
        }

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await db.User.findByPk(userId);
        console.log("User: ", user);

        if (!user) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }

        // Lưu thông tin người dùng vào `req.user` để sử dụng trong các bước tiếp theo
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
