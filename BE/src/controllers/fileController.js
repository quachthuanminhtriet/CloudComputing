const db = require('../models/indexModels');
const File = db.File;
const multer = require('../configs/multer');  // Thêm multer config
const path = require('path');
const fs = require('fs');
const streamifier = require('streamifier');
const cloudinary = require('../configs/cloudinary');

// --- [POST] /api/messages/uploadFile ---
exports.uploadFile = async (req, res) => {
    try {
        const upload = multer.single('file');

        upload(req, res, async (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const { file } = req;
            const { messageId } = req.body;

            if (!file) return res.status(400).json({ error: 'No file uploaded' });

            // Upload lên Cloudinary
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'your_folder_name',  // tùy bạn đặt
                            resource_type: 'raw'         // vì có thể là Word, PDF,...
                        },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload();

            // Lưu thông tin file vào DB
            const fileData = await File.create({
                fileUrl: result.secure_url,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                messageId,
                uploaderId: req.user.id
            });

            res.status(201).json(fileData);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// --- [GET] /api/messages/downloadFile/:filename ---
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        res.redirect(file.fileUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};