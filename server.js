const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("call-user", (data) => {
    io.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id,
    });
  });

  socket.on("make-answer", (data) => {
    io.to(data.to).emit("answer-made", {
      answer: data.answer,
      socket: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", {
      candidate: data.candidate,
      socket: socket.id,
    });
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
