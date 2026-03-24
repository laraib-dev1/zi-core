import User from "../models/User.js";
import Order from "../models/Order.js";
import CustomerAddress from "../models/CustomerAddress.js";
import Wishlist from "../models/Wishlist.js";
import connectDB from "../config/db.js";

// Get user profile
export const getUserProfile = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
};

// Update user profile
export const updateUserProfile = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { name, email, phone } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password");
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
};

// Change password
export const changePassword = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required");
  }
  
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new Error("User not found");
  }
  
  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.default.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }
  
  const hashedPassword = await bcrypt.default.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  
  return { message: "Password changed successfully" };
};

// Get user addresses
export const getUserAddresses = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  let customerAddress = await CustomerAddress.findOne({ userId: req.user.id });
  if (!customerAddress) {
    customerAddress = await CustomerAddress.create({ userId: req.user.id, addresses: [] });
  }
  
  return customerAddress.addresses;
};

// Add user address
export const addUserAddress = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  let customerAddress = await CustomerAddress.findOne({ userId: req.user.id });
  if (!customerAddress) {
    customerAddress = await CustomerAddress.create({ userId: req.user.id, addresses: [] });
  }
  
  const newAddress = req.body;
  
  // Check if address already exists (by phone, line1, postalCode, firstName, and lastName)
  const addressExists = customerAddress.addresses.some(
    (addr) =>
      addr.phone?.trim() === newAddress.phone?.trim() &&
      addr.line1?.trim() === newAddress.line1?.trim() &&
      addr.postalCode?.trim() === newAddress.postalCode?.trim() &&
      addr.firstName?.trim() === newAddress.firstName?.trim() &&
      addr.lastName?.trim() === newAddress.lastName?.trim()
  );
  
  if (addressExists) {
    // Address already exists, return existing addresses without adding
    return customerAddress.addresses;
  }
  
  // If this is the first address or user wants it as default, set as default
  if (customerAddress.addresses.length === 0 || newAddress.isDefault) {
    // Remove default from all addresses
    customerAddress.addresses.forEach(addr => addr.isDefault = false);
    newAddress.isDefault = true;
  }
  
  customerAddress.addresses.push(newAddress);
  customerAddress.updatedAt = new Date();
  await customerAddress.save();
  
  return customerAddress.addresses;
};

// Update user address
export const updateUserAddress = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { addressId } = req.params;
  const customerAddress = await CustomerAddress.findOne({ userId: req.user.id });
  if (!customerAddress) {
    throw new Error("No addresses found");
  }
  
  const addressIndex = customerAddress.addresses.findIndex(
    addr => addr._id.toString() === addressId
  );
  if (addressIndex === -1) {
    throw new Error("Address not found");
  }
  
  // If setting as default, remove default from others
  if (req.body.isDefault) {
    customerAddress.addresses.forEach(addr => addr.isDefault = false);
  }
  
  customerAddress.addresses[addressIndex] = {
    ...customerAddress.addresses[addressIndex].toObject(),
    ...req.body,
  };
  customerAddress.updatedAt = new Date();
  await customerAddress.save();
  
  return customerAddress.addresses;
};

// Delete user address
export const deleteUserAddress = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { addressId } = req.params;
  const customerAddress = await CustomerAddress.findOne({ userId: req.user.id });
  if (!customerAddress) {
    throw new Error("No addresses found");
  }
  
  customerAddress.addresses = customerAddress.addresses.filter(
    addr => addr._id.toString() !== addressId
  );
  customerAddress.updatedAt = new Date();
  await customerAddress.save();
  
  return customerAddress.addresses;
};

// Get user wishlist
export const getUserWishlist = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const wishlist = await Wishlist.find({ userId: req.user.id })
    .populate("productId")
    .sort({ createdAt: -1 });
  
  return wishlist.map(item => item.productId);
};

// Add to wishlist
export const addToWishlist = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { productId } = req.body;
  if (!productId) {
    throw new Error("Product ID is required");
  }
  
  try {
    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      productId,
    });
    
    return await Wishlist.findById(wishlistItem._id).populate("productId");
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Product already in wishlist");
    }
    throw error;
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const { productId } = req.params;
  const result = await Wishlist.findOneAndDelete({
    userId: req.user.id,
    productId,
  });
  
  if (!result) {
    throw new Error("Item not found in wishlist");
  }
  
  return { message: "Item removed from wishlist" };
};

