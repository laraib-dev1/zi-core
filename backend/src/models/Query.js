import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema({
  email: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Pending", enum: ["Pending", "Read", "Replied"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Query || mongoose.model("Query", QuerySchema);









