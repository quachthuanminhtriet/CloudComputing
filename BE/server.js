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
// Gắn io vào app để dùng trong controller
app.set('io', io);

// Dùng global lưu map userId -> socketId
global.userSocketMap = {};

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