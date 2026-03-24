import Query from "../models/Query.js";
import connectDB from "../config/db.js";

// Fetch all queries (admin only)
export const getQueries = async (req) => {
  await connectDB();
  const queries = await Query.find().sort({ createdAt: -1 });
  return queries;
};

// Create query (public)
export const createQuery = async (req) => {
  await connectDB();
  const { email, subject, description } = req.body;
  
  if (!email || !subject || !description) {
    throw new Error("Email, subject, and description are required");
  }
  
  const query = await Query.create({
    email,
    subject,
    description,
  });
  
  return query;
};

// Update query status (admin only)
export const updateQueryStatus = async (req) => {
  await connectDB();
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Read", "Replied"].includes(status)) {
    throw new Error("Invalid status. Must be Pending, Read, or Replied");
  }

  const query = await Query.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!query) {
    throw new Error("Query not found");
  }

  return query;
};

// Delete query (admin only)
export const deleteQuery = async (req) => {
  await connectDB();
  const { id } = req.params;
  
  const query = await Query.findByIdAndDelete(id);
  
  if (!query) {
    throw new Error("Query not found");
  }
  
  return { message: "Query deleted successfully" };
};









