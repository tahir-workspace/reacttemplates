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

// === START SERVER ===
server.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});
