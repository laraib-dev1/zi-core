import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../config/db.js";
import cloudinary from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper for serverless
// const uploadToCloud = async (file) => {
//   if (!file) return "";

//   const filepath = file.filepath || file.path; // Local + Vercel support

//   const result = await cloudinary.v2.uploader.upload(filepath);
//   try { fs.unlinkSync(filepath); } catch (e) {}

//   return result.secure_url;
// };

const uploadToCloud = async (file) => {
  if (!file) return "";

  // Vercel (no filepath → use buffer)
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  }

  // LOCAL (file.path exists)
  if (file.path) {
    const result = await cloudinary.v2.uploader.upload(file.path);
    try { fs.unlinkSync(file.path); } catch (e) {}
    return result.secure_url;
  }

  return "";
};


// JWT helper
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      adminAccess: !!user.adminAccess,
      adminTabAccess: Array.isArray(user.adminTabAccess) ? user.adminTabAccess : [],
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ----------------------------- REGISTER ----------------------------- */
export const registerUser = async (req) => {
  await connectDB();
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new Error("All fields are required");

  const emailLower = (typeof email === "string" ? email : "").trim().toLowerCase();
  const exists = await User.findOne({ email: emailLower });
  if (exists) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: emailLower,
    password: hashed,
    role: "user",
    adminAccess: false,
    adminTabAccess: [],
  });

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminAccess: user.adminAccess,
      adminTabAccess: user.adminTabAccess || [],
    },
  };
};

/* ----------------------------- LOGIN ----------------------------- */
export const loginUser = async (req) => {
  await connectDB();
  const { email, password } = req.body;

  if (!email || !password)
    throw new Error("Email and password required");

  const emailLower = (typeof email === "string" ? email : "").trim().toLowerCase();
  const user = await User.findOne({ email: emailLower });
  if (!user) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Login] No user found for email:", emailLower, "- Run: cd backend && npm run seed-admin");
    }
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Login] Wrong password for:", emailLower);
    }
    throw new Error("Invalid credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminAccess: user.adminAccess,
      adminTabAccess: user.adminTabAccess || [],
    },
  };
};

/* ----------------------------- ADMIN LOGIN ----------------------------- */
export const adminLoginUser = async (req) => {
  await connectDB();
  const { email, password } = req.body;

  const emailLower = (typeof email === "string" ? email : "").trim().toLowerCase();
  const user = await User.findOne({ email: emailLower });
  if (!user) throw new Error("Invalid credentials");
  if (user.role !== "admin") throw new Error("Not an admin");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminAccess: user.adminAccess,
      adminTabAccess: user.adminTabAccess || [],
    },
  };
};

/* ----------------------------- GET PROFILE ----------------------------- */
export const getMe = async (req) => {
  await connectDB();
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new Error("User not found");

  return { user };
};

/* ----------------------------- UPDATE PROFILE ----------------------------- */
export const updateProfileUser = async (req) => {
  await connectDB();
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true }
  ).select("-password");

  return { user };
};

/* ----------------------------- CHANGE PASSWORD ----------------------------- */
export const changePasswordUser = async (req) => {
  await connectDB();
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error("Old password incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password updated" };
};

/* ----------------------------- UPDATE AVATAR ----------------------------- */
export const updateAvatarUser = async (req) => {
  await connectDB();

  console.log("Update Avatar - Request files:", req.files);
  console.log("Update Avatar - Request body:", req.body);
  
  const file = req.files?.avatar?.[0];
  if (!file) {
    console.error("Update Avatar - No file found in req.files:", {
      files: req.files,
      body: req.body,
      hasFiles: !!req.files,
      avatarExists: !!req.files?.avatar,
      avatarLength: req.files?.avatar?.length
    });
    throw new Error("No file uploaded");
  }

  console.log("Update Avatar - File received:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    hasBuffer: !!file.buffer,
    hasPath: !!file.path
  });

  const avatarUrl = await uploadToCloud(file);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  ).select("-password");

  return { avatar: avatarUrl };
};
