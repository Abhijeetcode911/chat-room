const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const users = {}; // Store users and their socket IDs

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');
    users[socket.id] = { nickname: `User${Object.keys(users).length + 1}` }; // Assign a nickname

    // Notify others that a user has joined
    io.emit('user list', Object.values(users).map(user => user.nickname));

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.id]; // Remove user from list
        io.emit('user list', Object.values(users).map(user => user.nickname)); // Update user list
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', `${users[socket.id].nickname}: ${msg}`);
    });

    socket.on('private message', (msg, toNickname) => {
        const recipientId = Object.keys(users).find(key => users[key].nickname === toNickname);
        if (recipientId) {
            socket.to(recipientId).emit('private message', `${users[socket.id].nickname}: ${msg}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});