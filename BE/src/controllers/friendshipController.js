const db = require('../models/indexModels');
const Friendship = db.Friendship;

exports.sendFriendRequest = async (req, res) => {
    try {
        const { addresseeId } = req.body;
        const request = await Friendship.create({
            requesterId: req.user.id,
            addresseeId,
            status: 'pending'
        });

        await Notification.create({
            userId: addresseeId,
            message: `Bạn có lời mời kết bạn từ người dùng ${req.user.username}`,
            type: 'friend_request',
            isRead: false
        });        

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.acceptFriendRequest = async (req, res) => {
    try {
        const request = await Friendship.findByPk(req.params.id);
        if (!request || request.addresseeId !== req.user.id)
            return res.status(404).json({ error: 'Request not found' });

        request.status = 'accepted';
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
