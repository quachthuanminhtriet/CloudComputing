const db = require('../models/indexModels');
const SearchHistory = db.History;
const { Op } = require('sequelize');

// [GET] /api/search/messages?keyword=...
exports.searchMessages = async (req, res) => {
    try {
        const { keyword } = req.query;

        const results = await db.Message.findAll({
            where: {
                content: {
                    [Op.like]: `%${keyword}%`
                },
                senderId: req.userId
            },
            limit: 50,
            order: [['createdAt', 'DESC']]
        });

        await SearchHistory.create({
            userId: req.userId,
            keyword
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
