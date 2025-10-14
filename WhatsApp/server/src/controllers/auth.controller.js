import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      const useData = await newUser.save();
      generateToken(useData.id, res);

      console.log(useData);

      res.status(201).json({
        _id: useData.id,
        fullName: useData.fullName,
        email: useData.email,
        profilePhoto: useData.profilePhoto,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      _id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePhoto } = req.body;
    const userId = req.user.id;

    console.log("userId:", userId);

    if (!profilePhoto) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePhoto);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { fullName, about } = req.body;

    if (!fullName) {
      return res
        .status(400)
        .json({ message: "Full name and bio are required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, about },
      { new: true }
    );

    const { password, ...rest } = updatedUser;
    res.status(200).json(rest);
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
