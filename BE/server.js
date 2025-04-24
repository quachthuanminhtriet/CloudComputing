const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Assuming your express app is in app.js
const db = require('./src/models/indexModels');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {}; // To map userId to socketId

// Socket connection handler
io.on('connection', (socket) => {
  // Register user and map their socketId
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle message sending (text or file) between users
  socket.on('sendMessage', async (data) => {
    try {
      const senderId = socket.userId;
      const { toUserId, content, file } = data;

      // Handle file upload logic here if file is present
      let fileUrl = null;
      let messageType = 'text'; // Default message type

      // If a file is attached, handle upload logic
      if (file) {
        const result = await uploadFile(file, senderId, toUserId); // Call API for file upload
        fileUrl = result.secure_url;  // Cloudinary URL for the file
        messageType = 'file';  // Set message type to 'file'
      }

      // Save message to database
      const message = await Message.create({
        content: content || 'File attached',
        type: messageType,
        senderId,
        receiverId: toUserId,
        isRead: false,
        fileUrl,
        fileType: file ? file.mimetype : null,
      });

      // Send message (text or file) to receiver in real-time
      const receiverSocketId = userSocketMap[toUserId];
      if (receiverSocketId) {
        const sender = await User.findByPk(senderId, { attributes: ['id', 'fullName', 'avatarUrl'] });

        io.to(receiverSocketId).emit('chat message', {
          message: {
            ...message.toJSON(),
            sender: sender
          },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Disconnect user when they leave
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
