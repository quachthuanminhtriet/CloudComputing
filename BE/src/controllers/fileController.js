const db = require('../models/indexModels');
const File = db.File;
const multer = require('../configs/multer');  // Thêm multer config
const path = require('path');

// --- [POST] /api/messages/uploadFile ---
exports.uploadFile = async (req, res) => {
    try {
        // Tải file lên thông qua Multer
        const upload = multer.single('file'); // 'file' là tên trường file trong form data

        upload(req, res, async (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const { file } = req;  // file được tải lên
            const { messageId } = req.body;  // ID của tin nhắn mà file liên quan

            // Lưu thông tin file vào cơ sở dữ liệu
            const fileData = await File.create({
                fileUrl: `/uploads/${file.filename}`, // Đường dẫn tới file đã tải lên
                fileName: file.originalname,           // Tên file gốc
                fileType: file.mimetype,              // Loại file
                fileSize: file.size,                  // Kích thước file
                messageId,                            // ID tin nhắn
                uploaderId: req.user.id               // ID người tải lên
            });

            res.status(201).json(fileData);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/messages/download/:filename ---
exports.downloadFile = (req, res) => {
    const { filename } = req.params;

    const filePath = path.join(__dirname, '..', 'uploads', filename); // Đường dẫn tới file
    res.download(filePath, filename, (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to download file' });
        }
    });
};
