import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    //const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const filteredUsers = await User.prismaQuery().findMany({
      where: {
        id: {
          not: loggedInUserId, // same as $ne in MongoDB
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePhoto: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userToChatId = parseInt(req.params.id);
    const myId = parseInt(req.user.id);

    const messages = await Message.prismaQuery().findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      text,
      image: imageUrl,
    });

    const messageData = await newMessage.save(); //saving message to database

    // newMessage.createdAt = new Date().toISOString();
    // newMessage.updatedAt = new Date().toISOString();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      //check if user online then send message
      console.log(
        "Emitting to socket ID:",
        receiverSocketId,
        "Message:",
        newMessage
      );
      //io.to(receiverSocketId).emit("newMessage", messageData);
      console.log(io.emit("newMessage", messageData));
    }

    res.status(201).json(messageData);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
