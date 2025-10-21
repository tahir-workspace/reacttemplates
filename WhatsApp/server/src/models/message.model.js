import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

class Message {
  constructor({
    senderId,
    receiverId,
    text = null,
    file = null,
    audio = null,
  }) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.text = text;
    this.file = file;
    this.audio = audio;
  }

  // ---------- Instance Methods ----------
  async save() {
    const message = await prisma.message.create({
      data: {
        senderId: this.senderId,
        receiverId: this.receiverId,
        text: this.text,
        file: this.file,
        audio: this.audio,
      },
    });
    return message;
  }

  // ---------- Static Methods ----------
  static async create(data) {
    return await prisma.message.create({ data });
  }

  static async find(where = {}) {
    return await prisma.message.findMany({
      where,
      include: { sender: true, receiver: true },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findOne(where) {
    return await prisma.message.findFirst({
      where,
      include: { sender: true, receiver: true },
    });
  }

  static async findById(id) {
    return await prisma.message.findUnique({
      where: { id },
      include: { sender: true, receiver: true },
    });
  }

  static async findByIdAndUpdate(id, data) {
    return await prisma.message.update({
      where: { id },
      data,
      include: { sender: true, receiver: true },
    });
  }

  static async findByIdAndDelete(id) {
    return await prisma.message.delete({
      where: { id },
    });
  }

  static async updateOne(where, data) {
    return await prisma.message.updateMany({ where, data });
  }

  static async deleteOne(where) {
    return await prisma.message.deleteMany({ where });
  }

  static async count(where = {}) {
    return await prisma.message.count({ where });
  }

  static async findConversation(userAId, userBId) {
    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { sender: true, receiver: true },
    });
  }

  static prismaQuery() {
    return prisma.message;
  }
}

export default Message;
