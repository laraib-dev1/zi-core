import API from "./axios";
import axios from "axios";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
}

export interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  area?: string;
  postalCode: string;
  phone: string;
  line1: string;
  isDefault?: boolean;
}

export interface Order {
  _id: string;
  userId?: string;
  customerName: string;
  address: Address;
  phoneNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  type: string;
  bill: number;
  payment: string;
  status: string;
  createdAt: string;
}

// Profile APIs
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null; // Return null instead of throwing to prevent 401 error
  }
  try {
    const res = await API.get("/user/profile");
    return res.data.data;
  } catch (error: any) {
    // Handle cancelled requests and 401 errors silently
    if (error?.message === 'No token - request cancelled' || 
        error?.response?.status === 401 || 
        error?.message === 'Unauthorized' || 
        error?.name === 'SilentError' ||
        axios.isCancel(error)) {
      return null;
    }
    throw error;
  }
};

export const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const res = await API.put("/user/profile", data);
  return res.data.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await API.post("/user/change-password", { currentPassword, newPassword });
  return res.data;
};

// Address APIs
export const getUserAddresses = async (): Promise<Address[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    return []; // Return empty array instead of making API call
  }
  try {
    const res = await API.get("/user/addresses");
    return res.data.data;
  } catch (error: any) {
    // Handle cancelled requests and 401 errors silently
    if (error?.message === 'No token - request cancelled' || 
        error?.response?.status === 401 || 
        error?.message === 'Unauthorized' || 
        error?.name === 'SilentError' ||
        axios.isCancel(error)) {
      return [];
    }
    throw error;
  }
};

export const addUserAddress = async (address: Omit<Address, "_id">): Promise<Address[]> => {
  const res = await API.post("/user/addresses", address);
  return res.data.data;
};

export const updateUserAddress = async (addressId: string, address: Partial<Address>): Promise<Address[]> => {
  const res = await API.put(`/user/addresses/${addressId}`, address);
  return res.data.data;
};

export const deleteUserAddress = async (addressId: string): Promise<Address[]> => {
  const res = await API.delete(`/user/addresses/${addressId}`);
  return res.data.data;
};

// Order APIs
export const getUserOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    return [];
  }
  try {
    const res = await API.get("/orders/my-orders");
    return res.data;
  } catch (error: any) {
    // Handle cancelled requests and 401 errors silently
    if (error?.message === 'No token - request cancelled' || 
        error?.response?.status === 401 || 
        error?.message === 'Unauthorized' || 
        error?.name === 'SilentError' ||
        axios.isCancel(error)) {
      return [];
    }
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const res = await API.get(`/orders/${orderId}`);
  return res.data;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const res = await API.patch(`/orders/${orderId}/cancel`);
  return res.data.order;
};

// Wishlist APIs
export const getUserWishlist = async () => {
  // Check token before making request to prevent unnecessary 401 errors
  const token = localStorage.getItem("token");
  if (!token) {
    // Return empty array instead of throwing error to prevent network request
    return [];
  }
  try {
    const res = await API.get("/user/wishlist");
    // Backend returns wishlist.map(item => item.productId), so data is array of products
    const wishlist = res.data.data || res.data || [];
    console.log("Wishlist API response:", wishlist);
    return Array.isArray(wishlist) ? wishlist : [];
  } catch (error: any) {
    // Handle cancelled requests and 401 errors silently
    if (error?.message === 'No token - request cancelled' || 
        error?.response?.status === 401 || 
        error?.message === 'Unauthorized' || 
        error?.name === 'SilentError' ||
        axios.isCancel(error)) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
};

export const addToWishlist = async (productId: string) => {
  // Check token before making request to prevent unnecessary 401 errors
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }
  const res = await API.post("/user/wishlist", { productId });
  return res.data.data;
};

export const removeFromWishlist = async (productId: string) => {
  // Check token before making request to prevent unnecessary 401 errors
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }
  const res = await API.delete(`/user/wishlist/${productId}`);
  return res.data;
};

