const db = require('../models/indexModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = db.User;

const JWT_SECRET = process.env.JWT_SECRET || '123456789@';

// --- [POST] /api/register ---
exports.register = async (req, res) => {
    try {
        const { username, email, password, birthday, fullName } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, passwordHash, birthday, fullName });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [POST] /api/login ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        console.log('password:', password);  // Log mật khẩu người dùng nhập
        console.log('hashed password:', user.passwordHash);  // Log mật khẩu đã băm trong DB
        
        const valid = await bcrypt.compare(password.trim(), user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/me ---
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {  // Sử dụng req.user.id thay vì req.userId
            attributes: ['id', 'username', 'email', 'avatarUrl', 'birthday', 'fullName']
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [PUT] /api/me ---
exports.updateProfile = async (req, res) => {
    try {
        const { username, avatarUrl, birthday, fullName } = req.body;
        const user = await User.findByPk(req.user.id);  // Sử dụng req.user.id thay vì req.userId

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.username = username || user.username;
        user.avatarUrl = avatarUrl || user.avatarUrl;
        user.birthday = birthday || user.birthday;
        user.fullName = fullName || user.fullName;

        await user.save();

        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
