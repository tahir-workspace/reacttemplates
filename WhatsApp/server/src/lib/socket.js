import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.LOCAL_ORIGIN, process.env.PROD_ORIGIN],
  },
});

const userSocketMap = {}; //{userId:socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("A user connected:", socket.id, "UserId:", userId);

  // If same userId already exists, disconnect old socket
  if (userId && userSocketMap[userId]) {
    const previousSocketId = userSocketMap[userId];
    const previousSocket = io.sockets.sockets.get(previousSocketId);
    if (previousSocket) {
      console.log(`Disconnecting previous socket for user ${userId}`);
      previousSocket.disconnect(true);
    }
  }

  // Save new socket ID
  if (userId) userSocketMap[userId] = socket.id;

  // Notify all users of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  // Call user event
  socket.on("call-user", ({ targetUserId, callerId }) => {
    io.to(targetUserId).emit("incoming-call", { callerId });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
