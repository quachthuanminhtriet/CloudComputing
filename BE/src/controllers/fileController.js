const db = require('../models/indexModels');
const File = db.File;

exports.uploadFile = async (req, res) => {
    try {
        const { fileUrl, fileName, fileType, fileSize, messageId } = req.body;
        const file = await File.create({
            fileUrl,
            fileName,
            fileType,
            fileSize,
            messageId,
            uploaderId: req.user.id
        });
        res.status(201).json(file);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
