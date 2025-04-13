const multer = require('multer');
const path = require('path');

// Thiết lập nơi lưu trữ file và cách đặt tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Lưu file vào thư mục src/uploads/
        cb(null, path.join(__dirname, '..', 'uploads')); // Đảm bảo là src/uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên file theo thời gian và tên gốc
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
