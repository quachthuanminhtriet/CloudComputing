const db = require('../models/indexModels');
const File = db.File;
const multer = require('../configs/multer');  // Thêm multer config
const path = require('path');
const fs = require('fs');

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

            console.log(fileData);
            res.status(201).json(fileData);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/messages/downloadFile/:filename ---
exports.downloadFile = (req, res) => {
    const { filename } = req.params;

    // Đường dẫn file từ thư mục gốc của dự án (nằm ngoài BE)
    const filePath = path.join(__dirname, '..', 'uploads', filename); // Đảm bảo dùng 'uploads' từ thư mục gốc

    console.log('File path:', filePath); // In ra đường dẫn file để kiểm tra

    // Kiểm tra file có tồn tại không
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Trả về file cho client
        res.download(filePath, filename, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to download file' });
            }
        });
    });
};