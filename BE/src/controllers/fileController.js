const db = require('../models/indexModels');
const File = db.File;
const cloudinary = require('../configs/cloudinary');
const streamifier = require('streamifier');
const axios = require('axios');

// --- [POST] /api/messages/uploadFile ---
exports.uploadFile = async (req, res) => {
    try {
        const { file } = req.files; // express-fileupload
        const { messageId } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload lên Cloudinary (resource_type: raw)
        const streamUpload = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'chat_files',
                        resource_type: 'raw'
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

        // Lưu file vào DB
        const fileData = await File.create({
            fileUrl: result.secure_url,
            fileName: file.name,
            fileType: file.mimetype, // ex: application/pdf, image/png
            fileSize: file.size,
            messageId,
            uploaderId: req.user.id // Middleware đã xác thực user
        });

        res.status(201).json(fileData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// --- [GET] /api/messages/downloadFile/:id ---
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const { fileUrl, fileName, fileType } = file;

        try {
            const response = await axios({
                method: 'get',
                url: fileUrl,
                responseType: 'stream',
            });

            // Bắt trình duyệt tải về
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            res.setHeader('Content-Type', fileType || 'application/octet-stream');

            if (response.headers['content-length']) {
                res.setHeader('Content-Length', response.headers['content-length']);
            }

            // Gửi file về FE
            response.data.pipe(res);

            response.data.on('error', (err) => {
                console.error('Streaming error:', err.message);
                res.status(500).end('Streaming error');
            });

        } catch (error) {
            console.error('Error fetching from Cloudinary:', error.message);
            return res.status(500).json({ error: 'Failed to download file from Cloudinary' });
        }

    } catch (err) {
        console.error('Server error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

