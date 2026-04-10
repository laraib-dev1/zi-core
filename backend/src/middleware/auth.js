import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to request (without password)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      adminAccess: !!decoded.adminAccess,
      adminTabAccess: Array.isArray(decoded.adminTabAccess) ? decoded.adminTabAccess : [],
    };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin" && !req.user.adminAccess) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
