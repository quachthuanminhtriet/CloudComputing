const db = require('../models/indexModels');
const Friendship = db.Friendship;
const Notification = db.Notification;
const { Op } = db.Sequelize;


// --- [GET] /api/friends ---
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID người dùng từ token

        // Tìm các mối quan hệ kết bạn giữa userId và các user khác có trạng thái 'accepted'
        const friends = await db.Friendship.findAll({
            where: {
                [Op.or]: [
                    { requesterId: userId, status: 'accepted' },
                    { addresseeId: userId, status: 'accepted' }
                ]
            },
            include: [
                {
                    model: db.User,
                    as: 'requester', // Bạn bè theo vai trò requester
                    attributes: ['id', 'username', 'avatarUrl']
                },
                {
                    model: db.User,
                    as: 'addressee', // Bạn bè theo vai trò addressee
                    attributes: ['id', 'username', 'avatarUrl']
                }
            ]
        });

        // Lọc danh sách bạn bè
        const friendsList = friends.map(friend => {
            return friend.requesterId === userId
                ? friend.addressee
                : friend.requester;
        });

        res.json(friendsList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


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

exports.cancelFriendRequest = async (req, res) => {
    try {
        const request = await Friendship.findByPk(req.params.id);
        if (!request || request.addresseeId !== req.user.id) {
            return res.status(404).json({ error: 'Request not found hoặc bạn không phải người nhận' });
        }

        request.status = 'blocked';
        await request.save();

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


exports.getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Friendship.findAll({
            where: {
                addresseeId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: db.User,
                    as: 'requester',
                    attributes: ['id', 'username', 'avatarUrl']
                }
            ]
        });

        // Trả về danh sách requester (người gửi lời mời)
        const pendingRequests = requests.map(req => ({
            id: req.id,
            requester: req.requester
        }));

        res.json(pendingRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};