const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const db = require('./src/models/indexModels');

const PORT = process.env.PORT || 3000;

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Gắn io vào app để dùng trong controller
app.set('io', io);

// Dùng global lưu map userId -> socketId
global.userSocketMap = {};

io.on('connection', (socket) => {
  // Đăng ký user khi kết nối socket
  socket.on('register', (userId) => {
    global.userSocketMap[userId] = socket.id;
    socket.userId = userId;
    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  });

  // Nhận tin nhắn và gửi tới người nhận (nếu online)
  socket.on('chat message', ({ toUserId, message }) => {
    const toSocketId = global.userSocketMap[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit('chat message', {
        message,
        fromUserId: socket.userId
      });
    }
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    if (socket.userId && global.userSocketMap[socket.userId]) {
      delete global.userSocketMap[socket.userId];
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

// Sync DB và khởi động server
db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
