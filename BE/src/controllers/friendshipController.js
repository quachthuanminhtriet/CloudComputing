const db = require('../models/indexModels');
const Friendship = db.Friendship;
const Notification = db.Notification;

exports.sendFriendRequest = async (req, res) => {
    try {
        const { addresseeId } = req.body;

        if (!addresseeId) {
            return res.status(400).json({ error: 'Thiếu addresseeId' });
        }

        const request = await Friendship.create({
            requesterId: req.user.id,
            addresseeId,
            status: 'pending'
        });

        await Notification.create({
            userId: addresseeId,               // Người nhận là người được mời
            senderId: req.user.id,             // Người gửi là người đang gửi lời mời
            message: `Bạn có lời mời kết bạn từ người dùng ${req.user.username}`,
            type: 'friend_request',
            isRead: false
        });

        res.status(201).json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.acceptFriendRequest = async (req, res) => {
    try {
        const request = await Friendship.findByPk(req.params.id);
        if (!request || request.addresseeId !== req.user.id) {
            return res.status(404).json({ error: 'Request not found hoặc bạn không phải người nhận' });
        }

        request.status = 'accepted';
        await request.save();

        await Notification.create({
            userId: request.requesterId,       // Người nhận thông báo là người đã gửi lời mời
            senderId: req.user.id,             // Người chấp nhận là người gửi lại thông báo
            message: `Lời mời kết bạn của bạn đã được ${req.user.username} chấp nhận!`,
            type: 'friend_accept',
            isRead: false
        });

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
