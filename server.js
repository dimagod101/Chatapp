const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static("public"));

// Handle client connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle incoming messages
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Broadcast the message to all clients
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
