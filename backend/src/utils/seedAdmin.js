// src/utils/seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminEmail = "admin@gmail.com";
    const adminPassword = "11223344";

    let admin = await User.findOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (admin) {
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.name = "Admin";
      await admin.save();
      console.log("Admin updated (email: admin@gmail.com, role: admin).");
    } else {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin created (email: admin@gmail.com).");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin", err);
    process.exit(1);
  }
}

seedAdmin();
