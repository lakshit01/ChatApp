require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
const harperSaveMessage = require("./services/harper-save-message.js");
const harperGetMessages = require("./services/harper-get-message");
const { response } = require('express');
const leaveRoom = require('./utils/leave-room');

const app = express();

app.use(cors());

const Port = process.env.PORT || 4000;

const server = http.createServer(app);

// Allow for CORS from frontend with GET and POST method
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

const CHAT_BOT = 'Admin';
let chatRoom = ''; // Stores chatroom
let allUsers = []; // Stores all users in the room

// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
    // console.log(`User connected ${socket.id}`);

    // Add a user to a room
    socket.on('join_room', (data) => {
        const {username, room} = data; // Data sent from client when join_event emitted
        socket.join(room); // Join the user to a room

        let _createdtime_ = Date.now(); // Current time
        // Send message to all user in a room
        socket.to(room).emit('receive_message', {
            message: `${username} has join the room`,
            username: CHAT_BOT,
            _createdtime_,
        });

        socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            _createdtime_,
        });

        // Save the new user to room
        chatRoom = room;
        allUsers.push({id: socket.id, username, room});
        chatRoomUsers = allUsers.filter((user) => user.room === room);
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers)

        // Get last 100 message from database
        harperGetMessages(room)
            .then((last100Messages) => {
                // console.log('latest messages', last100Messages);
                socket.emit('last_100_messages', last100Messages);
            })
            .catch((err) => console.log(err));
    });

    socket.on("send_message", (data) => {
        const {message, username, room, _createdtime_} = data;
        io.in(room).emit('receive_message', data); // Send to all users in room
        harperSaveMessage(message, username, room, _createdtime_) // save message to database
           .then((response) => console.log(response))
           .catch((err) => console.log(err));
    });

    socket.on('leave_room', (data) => {
        const { username, room } = data;
        socket.leave(room);
        const __createdtime__ = Date.now();
        // Remove user from memory
        allUsers = leaveRoom(socket.id, allUsers);
        socket.to(room).emit('chatroom_users', allUsers);
        socket.to(room).emit('receive_message', {
          username: CHAT_BOT,
          message: `${username} has left the chat`,
          __createdtime__,
        });
        // console.log(`${username} has left the chat`);
      });
});

app.get('/', (req, res) => {
    res.send('Hello World')
})

server.listen(Port, () => 'Server is running on port no 4000');