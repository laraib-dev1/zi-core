import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = (process.env.MONGO_URI || "").trim();
  if (!uri || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    throw new Error("Invalid scheme, expected connection string to start with 'mongodb://' or 'mongodb+srv://'");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      })
      .then((m) => m)
      .catch((err) => {
        // Allow next request/startup attempt to retry the connection.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected:", cached.conn.connection.host);
  return cached.conn;
};

export default connectDB;
