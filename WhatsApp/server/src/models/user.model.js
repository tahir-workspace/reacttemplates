import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

class User {
  constructor({ email, fullName, password, profilePhoto = "", about = "" }) {
    this.email = email;
    this.fullName = fullName;
    this.password = password;
    this.profilePhoto = profilePhoto;
    this.about = about;
  }

  // ---------- Instance Methods ----------
  async save() {
    const user = await prisma.user.create({
      data: {
        email: this.email,
        fullName: this.fullName,
        password: this.password,
        profilePhoto: this.profilePhoto,
        about: this.about,
      },
    });
    return user;
  }

  // ---------- Static Methods ----------
  static async create(data) {
    return await prisma.user.create({ data });
  }

  static async find(where = {}) {
    return await prisma.user.findMany({ where });
  }

  static async findOne(where) {
    return await prisma.user.findFirst({ where });
  }

  static async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  static async findByIdAndUpdate(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  static async findByIdAndDelete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  static async updateOne(where, data) {
    return await prisma.user.updateMany({ where, data });
  }

  static async deleteOne(where) {
    return await prisma.user.deleteMany({ where });
  }

  static async count(where = {}) {
    return await prisma.user.count({ where });
  }

  static prismaQuery() {
    return prisma.user;
  }
}

export default User;
