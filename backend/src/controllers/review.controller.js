import connectDB from "../config/db.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

// Create review
export const createReview = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const { productId, productName, orderId, rating, comment } = req.body;

  if (!productId || !productName || !orderId || !rating || !comment) {
    throw new Error("All fields are required");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Verify that the order belongs to the user and is completed
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId && order.userId.toString() !== req.user.id) {
    throw new Error("Unauthorized to review this order");
  }

  if (order.status !== "Complete" && order.status !== "Completed") {
    throw new Error("Can only review completed orders");
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    userId: req.user.id,
    productId: productId,
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    userId: req.user.id,
    productId,
    productName,
    orderId,
    rating,
    comment,
  });

  return review;
};

// Get user's reviews
export const getUserReviews = async (req) => {
  await connectDB();
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const reviews = await Review.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("productId", "name image1");

  return reviews;
};

// Get all reviews (admin only)
export const getAllReviews = async (req) => {
  await connectDB();
  
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .populate("productId", "name image1")
    .limit(1000);

  return reviews;
};

// Get product reviews (public)
export const getProductReviews = async (req) => {
  await connectDB();
  const { productId } = req.params;

  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 })
    .populate("userId", "name")
    .limit(50);

  return reviews;
};

// Delete review (admin only)
export const deleteReview = async (req) => {
  await connectDB();
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);
  
  if (!review) {
    throw new Error("Review not found");
  }

  return { message: "Review deleted successfully" };
};

