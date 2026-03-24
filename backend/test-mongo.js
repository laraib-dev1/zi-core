import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function testDB() {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected:", db.connection.host);
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

testDB();
