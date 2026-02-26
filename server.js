const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.get("/", (req, res) => {
  res.send("Servidor rodando 🚀");
});

let waitingUser = null;

io.on("connection", (socket) => {

  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched", { initiator: true });
    waitingUser.emit("matched", { initiator: false });

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on("signal", (data) => {
    if (socket.partner) {
      socket.partner.emit("signal", data);
    }
  });

  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.emit("partner-disconnected");
      socket.partner.partner = null;
    }
    socket.partner = null;
    waitingUser = socket;
  });

  socket.on("disconnect", () => {
    if (socket.partner) {
      socket.partner.emit("partner-disconnected");
      socket.partner.partner = null;
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor rodando 🚀"));
