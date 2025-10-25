import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    //const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const filteredUsersRaw = await User.prismaQuery().findMany({
      where: {
        id: {
          not: loggedInUserId,
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

        sentMessages: {
          where: {
            receiverId: loggedInUserId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            text: true,
            file: true,
            audio: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
          },
        },
      },
    });

    // Attach lastMessage field directly into each user
    const filteredUsers = filteredUsersRaw
      .map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
        about: user.about,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastMessage: user.sentMessages[0] || null,
      }))
      // ✅ Sort by latest message timestamp (descending)
      .sort((a, b) => {
        const aTime = a.lastMessage
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const bTime = b.lastMessage
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return bTime - aTime;
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

export const deleteMessage = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const messageId = parseInt(req.params.id);
    const messageDetails = await Message.findOne({ id: messageId });

    //console.log("Message Details:", messageDetails);

    const receiverId =
      messageDetails.receiverId === loggedInUserId
        ? messageDetails.senderId
        : messageDetails.receiverId;

    await Message.prismaQuery().delete({
      where: { id: messageId },
    });

    if (messageDetails) {
      const { file, audio } = messageDetails;
      if (file && file !== "") {
        const fileParts = file.split("/");
        const publicIdFileWithExt = fileParts[fileParts.length - 1];
        const publicIdFile = publicIdFileWithExt.split(".")[0];
        const cRes = await cloudinary.uploader.destroy(publicIdFile, {
          resource_type: "image",
        });

        console.log("Cloudinary file deletion response:", cRes);
      }

      if (audio && audio !== "") {
        const audioParts = audio.split("/");
        const publicIdAudioPartsWithExt = audioParts[audioParts.length - 1];
        const publicIdAudio = publicIdAudioPartsWithExt.split(".")[0];
        const cRes = await cloudinary.uploader.destroy(publicIdAudio, {
          resource_type: "video",
        });
        console.log("Cloudinary file deletion response:", cRes);
      }
    }
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("messageDeleted", { messageId, receiverId });
    console.log(
      "Emitting messageDeleted to socket ID:",
      receiverSocketId,
      messageId
    );
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, file, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (file) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(file);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      // Upload base64 audio to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "auto",
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      text,
      file: imageUrl,
      audio: audioUrl,
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
      io.to(receiverSocketId).emit("newMessage", messageData);
      //console.log(io.emit("newMessage", messageData));
    }

    res.status(201).json(messageData);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
