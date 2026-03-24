import Order from "../models/Order.js";

// Fetch all orders
export const getOrders = async (req) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  return orders;
};

// Create order
export const createOrder = async (req) => {
  // Add userId if user is authenticated
  const orderData = { ...req.body };
  if (req.user && req.user.id) {
    orderData.userId = req.user.id;
  }
  const order = await Order.create(orderData);
  return order;
};

// Get user's orders
export const getUserOrders = async (req) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return orders;
};
// Get single order by ID
export const getOrderById = async (req) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Check if user owns this order or is admin
  if (req.user && req.user.id) {
    if (order.userId && order.userId.toString() !== req.user.id && req.user.role !== "admin") {
      throw new Error("Unauthorized to view this order");
    }
  }
  
  return order;
};

// Cancel order (user can cancel their own pending orders)
export const cancelOrder = async (req) => {
  const { id } = req.params;
  
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }
  
  const order = await Order.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Check if user owns this order
  if (order.userId && order.userId.toString() !== req.user.id) {
    throw new Error("Unauthorized to cancel this order");
  }
  
  // Only allow canceling pending orders
  if (order.status !== "Pending") {
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }
  
  // Update order status to Cancelled and track cancellation info
  order.status = "Cancelled";
  order.cancelledBy = "user";
  order.cancelledAt = new Date();
  await order.save();
  
  return order;
};

// Update order status (admin)
export const updateOrderStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body;

  const updateData = { status };
  
  // If admin is cancelling, track it
  if (status === "Cancelled" || status === "Cancel") {
    updateData.cancelledBy = "admin";
    updateData.cancelledAt = new Date();
  }
  
  // If status is changed from Cancelled to something else, clear cancellation info
  const currentOrder = await Order.findById(id);
  if (currentOrder && (currentOrder.status === "Cancelled" || currentOrder.status === "Cancel")) {
    if (status !== "Cancelled" && status !== "Cancel") {
      updateData.cancelledBy = undefined;
      updateData.cancelledAt = undefined;
    }
  }

  const order = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};
