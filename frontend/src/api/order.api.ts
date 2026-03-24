import API from "./axios"; // your configured axios instance

export const fetchOrders = async () => {
  const res = await API.get("/orders"); // backend endpoint
  return res.data;
};
export const createOrder = async (orderData: any) => {
  const res = await API.post("/orders/create", orderData);
  return res.data;
};

export const getOrderById = async (orderId: string) => {
  const res = await API.get(`/orders/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await API.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};
