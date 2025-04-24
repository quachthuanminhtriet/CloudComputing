const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const db = require('./src/models/indexModels');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {};

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('chat message', ({ toUserId, message }) => {
    const toSocketId = userSocketMap[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit('chat message', {
        message,
        fromUserId: socket.userId
      });
    }
  });

  // Upload file
  socket.on('uploadFile', async (fileData) => {
    try {
      // Xử lý file upload ở backend
      const { file, receiverId } = fileData; // Giả sử bạn nhận được file và receiverId
      const senderId = socket.userId;

      // Thực hiện upload file (sử dụng hàm uploadFile đã tạo từ trước)
      const fileUrl = await uploadFile(file, senderId, receiverId); // Đây là ví dụ cách gọi hàm uploadFile

      // Gửi thông báo cho người nhận
      const toSocketId = userSocketMap[receiverId];
      if (toSocketId) {
        io.to(toSocketId).emit('file message', {
          fileUrl,
          fromUserId: senderId,
          toUserId: receiverId,
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId && userSocketMap[socket.userId]) {
      delete userSocketMap[socket.userId];
    }
  });
});

db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});