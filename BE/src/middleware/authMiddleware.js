const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '123456789@';

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        req.user = decoded; // Gán thông tin người dùng vào req.user
        next();
    });
};

module.exports = authMiddleware;
