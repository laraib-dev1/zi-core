import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String },
  postalCode: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const CustomerAddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  addresses: [AddressSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.CustomerAddress || mongoose.model("CustomerAddress", CustomerAddressSchema);

