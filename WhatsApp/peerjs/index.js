import express from "express";
import http from "http";
import fs from "fs";
import cors from "cors";
import { ExpressPeerServer } from "peer";
import dotenv from "dotenv";
dotenv.config();
// === CONFIG ===
const PORT = process.env.PORT; // or 5001 if testing locally (use sudo if 443)

// === EXPRESS APP ===
const app = express();
app.use(
  cors({
    origin: [process.env.LOCAL_ORIGIN, process.env.PROD_ORIGIN],
    credentials: true,
  })
);
app.use(express.json());

// === HTTPS SERVER ===
const server = http.createServer(app);

// === PEERJS SERVER ===
const peerServer = ExpressPeerServer(server, {
  debug: false,
  path: "/myapp",
  allow_discovery: true,
});
// Mount PeerJS on /peerjs
app.use("/peerjs", peerServer);

// Optional test route
app.get("/", (req, res) => res.send("✅ PeerJS server running!"));

// Track connected peers manually
const activePeers = new Set();

peerServer.on("connection", (client) => {
  console.log("Peer connected:", client.getId());
  activePeers.add(client.getId());
});

peerServer.on("disconnect", (client) => {
  console.log("Peer disconnected:", client.getId());
  activePeers.delete(client.getId());
});

// API endpoint to force remove a peer
app.get("/disconnect/:id", (req, res) => {
  const id = req.params.id;

  if (activePeers.has(id)) {
    activePeers.delete(id);
    console.log(`Force removed peer ${id}`);
    return res.send(`Peer ${id} removed`);
  }

  res.status(404).send(`Peer ${id} not found`);
});

// === START SERVER ===
server.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});
