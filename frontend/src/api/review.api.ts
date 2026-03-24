import API from "./axios";

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  productName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewData {
  productId: string;
  productName: string;
  orderId: string;
  rating: number;
  comment: string;
}

// Create review
export const createReview = async (data: CreateReviewData) => {
  const res = await API.post("/reviews", data);
  return res.data;
};

// Get user's reviews
export const getUserReviews = async (): Promise<Review[]> => {
  const res = await API.get("/reviews/my-reviews");
  return res.data.data;
};

// Get product reviews (public)
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const res = await API.get(`/reviews/product/${productId}`);
  return res.data.data;
};

// Get all reviews (admin only)
export const getAllReviews = async (): Promise<Review[]> => {
  const res = await API.get("/reviews");
  return res.data.data;
};

// Delete review (admin only)
export const deleteReview = async (reviewId: string) => {
  const res = await API.delete(`/reviews/${reviewId}`);
  return res.data;
};

