// src/socket.js
const { Server } = require('socket.io');
const { GroupMessage } = require('../models/GroupMessage'); // Import model lưu tin nhắn

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('Một client đã kết nối:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client đã ngắt kết nối:', socket.id);
        });

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`Client ${socket.id} đã tham gia phòng ${roomId}`);
        });

        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`Client ${socket.id} đã rời phòng ${roomId}`);
        });

        socket.on('sendGroupMessage', (data) => {
            io.to(data.groupId).emit('newGroupMessage', data);
            const { groupId, senderId, content } = data;
            GroupMessage.create({ groupId, senderId, content }).catch((err) => {
                console.error('Lỗi lưu tin nhắn nhóm:', err);
            });
        });
    });

    return io;
}

module.exports = initializeSocket;
