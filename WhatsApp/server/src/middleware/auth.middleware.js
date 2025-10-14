import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1Get token from cookie
    let token = req.cookies?.jwt;

    // If not found, try Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;

      // Expecting format: "Bearer <token>"
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    console.log(decoded);
    let user = await User.findById(decoded.userId);
    const { password, ...rest } = user;
    if (!rest) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = rest;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
