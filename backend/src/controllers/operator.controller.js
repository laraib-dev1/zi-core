import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { sendOperatorAccessEmail, sendOperatorCredentialEmail } from "../utils/operatorMail.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  adminAccess: !!user.adminAccess,
  adminTabAccess: Array.isArray(user.adminTabAccess) ? user.adminTabAccess : [],
  lastLoginAt: user.lastLoginAt || null,
  createdAt: user.createdAt || null,
  avatar: user.avatar || "",
});

export const getOperatorUsers = async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpiry").sort({ createdAt: -1 });
    res.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOperatorUserById = async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpiry");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOperatorUser = async (req, res) => {
  try {
    await connectDB();
    const { name, email, adminAccess, adminTabAccess } = req.body || {};
    const existing = await User.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateData = {};

    if (typeof name === "string") updateData.name = name.trim();
    if (typeof email === "string") updateData.email = email.trim().toLowerCase();
    if (typeof adminAccess === "boolean") updateData.adminAccess = adminAccess;
    if (Array.isArray(adminTabAccess)) {
      updateData.adminTabAccess = [...new Set(adminTabAccess.filter((path) => typeof path === "string" && path.startsWith("/admin/")))];
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    const changedBy = req.user?.email || "admin";
    const emailChanged = typeof updateData.email === "string" && updateData.email !== existing.email;
    const accessChanged = typeof updateData.adminAccess === "boolean" && updateData.adminAccess !== !!existing.adminAccess;
    const tabsChanged =
      Array.isArray(updateData.adminTabAccess) &&
      JSON.stringify(updateData.adminTabAccess) !== JSON.stringify(existing.adminTabAccess || []);

    try {
      if (accessChanged || tabsChanged) {
        await sendOperatorAccessEmail({
          to: user.email,
          name: user.name,
          granted: !!user.adminAccess,
          tabs: user.adminTabAccess || [],
          changedBy,
        });
      }
      if (emailChanged) {
        await sendOperatorCredentialEmail({
          to: user.email,
          name: user.name,
          emailChanged: true,
          passwordChanged: false,
          changedBy,
        });
      }
    } catch (mailError) {
      console.error("Operator email notification failed:", mailError?.message || mailError);
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOperatorPassword = async (req, res) => {
  try {
    await connectDB();
    const { newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    try {
      await sendOperatorCredentialEmail({
        to: user.email,
        name: user.name,
        emailChanged: false,
        passwordChanged: true,
        changedBy: req.user?.email || "admin",
      });
    } catch (mailError) {
      console.error("Operator password email failed:", mailError?.message || mailError);
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOperatorUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only full administrators can delete users" });
    }

    await connectDB();
    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(target._id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    if (target.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete an administrator account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
