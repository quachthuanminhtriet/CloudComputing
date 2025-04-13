const db = require('../models/indexModels');
const Notification = db.Notification;

exports.getNotifications = async (req, res) => {
    try {
        const list = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const noti = await Notification.findByPk(req.params.id);
        if (noti.userId !== req.user.id)
            return res.status(403).json({ error: 'Unauthorized' });

        noti.isRead = true;
        await noti.save();
        res.json(noti);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
