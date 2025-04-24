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

  socket.on('chat message', async ({ toUserId, message, fileData }) => {
    const toSocketId = userSocketMap[toUserId];
    if (toSocketId) {
      try {
        const savedMessage = await db.Message.create({ message, fileData }); // Example DB operation
        io.to(toSocketId).emit('chat message', {
          message: savedMessage.message,
          fileData: savedMessage.fileData,
          fromUserId: socket.userId
        });
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }
  });
  

  socket.on('file uploaded', ({ toUserId, fileData }) => {
    const toSocketId = userSocketMap[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit('file message', {
        fileData,
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