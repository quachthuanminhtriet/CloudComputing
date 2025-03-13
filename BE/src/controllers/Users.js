const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// Đăng ký user
const register = async (req, res) => {
    try {
        const { username, password, fullname, mail } = req.body;

        if (!username || !password || !fullname || !mail) {
            return res.status(400).json({ message: "Thiếu thông tin!" });
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) {
            return res.status(400).json({ message: "Email không hợp lệ!" });
        }

        // Kiểm tra username hoặc email đã tồn tại
        const existingUser = await Users.findOne({ where: { username } });
        const existingMail = await Users.findOne({ where: { mail } });

        if (existingUser) return res.status(400).json({ message: "Username đã tồn tại!" });
        if (existingMail) return res.status(400).json({ message: "Email đã được sử dụng!" });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = await Users.create({ username, password: hashedPassword, fullname, mail });

        res.status(201).json({ message: "Đăng ký thành công!", userId: newUser.id });
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

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Đăng nhập thành công!", token, userId: user.id });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy danh sách tất cả user (ẩn mật khẩu)
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ["id", "username", "fullname", "mail", "avatar", "createdAt"]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Cập nhật thông tin user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, mail, password, avatar } = req.body;

        const user = await Users.findByPk(id);
        if (!user) return res.status(404).json({ message: "User không tồn tại!" });

        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        

        await user.update({ fullname, mail, password: hashedPassword, avatar });

        res.json({ message: "Cập nhật thành công!", userId: user.id, avatar });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = { register, login, getAllUsers, updateUser };
