const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./src/configs/db');
const upload = require('./src/configs/multer'); // Import multer config
const fileUpload = require('express-fileupload');
const { Server } = require("socket.io");
const http = require('http');

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/friends', require('./src/routes/friendshipRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Messaging SaaS API!');
});

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 1. Tạo HTTP server từ ứng dụng Express
const server = http.createServer(app);

// 2. Khởi tạo Socket.IO server bằng HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Cấu hình origin phù hợp cho ứng dụng frontend của bạn
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {};

// 3. Lắng nghe các sự kiện kết nối từ client
io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on('chat message', ({ toUserId, message }) => {
    const toSocketId = userSocketMap[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit('chat message', { message });
    }
  });

  socket.on('disconnect', () => {
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

module.exports = app;
