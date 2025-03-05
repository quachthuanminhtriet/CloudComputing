const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users } = require('../models');

// Đăng ký user
const register = async (req, res) => {
    try {
        const { username, password, fullname, mail } = req.body;

        // Kiểm tra xem username hoặc mail đã tồn tại chưa
        const existingUser = await Users.findOne({ where: { username } });
        const existingMail = await Users.findOne({ where: { mail } });

        if (existingUser) {
            return res.status(400).json({ message: "Username đã tồn tại!" });
        }
        if (existingMail) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        // Mã hóa mật khẩu trước khi lưu vào database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = await Users.create({
            username,
            password: hashedPassword,
            fullname,
            mail
        });

        res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Đăng nhập user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Thiếu thông tin!" });

        const user = await Users.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy toàn bộ user
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: { exclude: ['password'] } // Không trả về mật khẩu
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname } = req.body;

        // Kiểm tra user có tồn tại không
        const user = await Users.findByPk(id);
        if (!user) return res.status(404).json({ message: "User không tồn tại!" });

        // Cập nhật user
        await user.update({ fullname });

        res.json({ message: "Cập nhật thành công!", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = { register, login, getAllUsers, updateUser };
