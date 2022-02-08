const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {generateMessage, generateLocationMessage} = require("./utils/messages");

// --------------APP SETUP START-------------//

const app = express();

const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

//----------------APP SETUP END----------------//

// ----------SOCKET SETUP START---------------//


io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", generateMessage("Welcome to the chat app!"));

  socket.broadcast.emit("message", generateMessage("New user joined!"));

  socket.on("sendMessage", (message) => {
    io.emit("message", generateMessage(message));
  });

  socket.on("sendLocation", (coords) => {
    io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("User has left the chat!"));
    console.log("User disconnected");
  })

});

// SOCKET ENDS

// SERVER
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
