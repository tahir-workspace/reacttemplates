import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ExpressPeerServer } from "peer";

//import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import bodyParser from "body-parser";

dotenv.config();

const PORT = process.env.PORT;
//const __dirname = path.resolve();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.LOCAL_ORIGIN, process.env.PROD_ORIGIN],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../FRONTEND/dist")));

//   app.get(/(.*)/, (req, res) => {
//     res.sendFile(path.join(__dirname, "../FRONTEND", "dist", "index.html"));
//   });
// }

// === PEERJS SERVER MOUNTED ===
const peerServer = ExpressPeerServer(server, {
  path: "/myapp",
});
app.use("/peerjs", peerServer);

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
});
