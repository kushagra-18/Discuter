const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { callbackify } = require("util");
// --------------APP SETUP START-------------//

const app = express();

const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 5000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

//----------------APP SETUP END----------------//

// ----------SOCKET SETUP START---------------//

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUsers({ id: socket.id, username, room });

    if (error) {
      return callbackify(error);
    }

    socket.join(user.room);

    socket
      .to(user.room)
      .emit("message", generateMessage("Welcome to the chat app!"));

    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${user.username} has joined!`));

    callback();
  });

  socket.on("sendMessage", (message) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(message));
  });

  socket.on("sendLocation", (coords) => {
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.name).emit(
        "message",
        generateMessage(user.username + "User has left the chat!")
      );
    }
  });
});

// SOCKET ENDS

// SERVER
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
