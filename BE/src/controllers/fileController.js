const db = require('../models/indexModels');
const File = db.File;
const Message = db.Message;
const Notification = db.Notification;
const cloudinary = require('../configs/cloudinary');
const streamifier = require('streamifier');
const axios = require('axios');

// --- [POST] /api/messages/uploadFile ---
exports.uploadFile = async (req, res) => {
    try {
        const file = req.files ? req.files.file : null;
        const receiverId = req.body.receiverId;
        const senderId = req.user.id;

        if (!file || !receiverId) {
            return res.status(400).json({ error: 'File và receiverId là bắt buộc' });
        }

        // Tạo tin nhắn mới
        const message = await Message.create({
            content: 'File đính kèm',
            type: 'file',
            senderId,
            receiverId,
            isRead: false
        });

        // Xác định loại file để upload đúng định dạng
        let resourceType = 'raw';
        if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }

        const streamUpload = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'chat_files',
                        resource_type: resourceType
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(file.data).pipe(stream);
            });
        };

        const result = await streamUpload();

        // Lưu thông tin file
        const fileData = await File.create({
            fileUrl: result.secure_url,
            fileName: file.name,
            fileType: file.mimetype,
            fileSize: file.size,
            uploaderId: senderId,
            messageId: message.id
        });

        // Cập nhật tin nhắn
        await message.update({
            fileUrl: result.secure_url,
            fileType: file.mimetype
        });

        res.status(201).json({ message, fileData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// --- [GET] /api/messages/downloadFile/:id ---
exports.downloadFile = async (req, res) => {
    try {
        const messageId = req.params.id;
        const file = await File.findOne({ where: { messageId } });
        if (!file) {
            return res.status(404).json({ error: 'File not found for this message' });
        }

        // Lấy stream từ Cloudinary
        const response = await axios.get(file.fileUrl, { responseType: 'stream' });

        // Thiết header giữ đúng MIME type
        res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
        // Nếu muốn hiển thị inline (trình duyệt sẽ render hình/audio/video), dùng inline:
        // res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
        // Nếu muốn ép download, dùng attachment:
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);

        // Đặt Content-Length nếu có
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        // Pipe thẳng stream về client
        response.data.pipe(res).on('error', err => {
            console.error('Streaming error:', err);
            if (!res.headersSent) res.status(500).end('Streaming error');
        });

    } catch (err) {
        console.error('Server error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
};