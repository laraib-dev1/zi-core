import API from "./axios";

export const createPaymentIntent = async (amount: number) => {
  console.log("Sending amount:", amount);
  const res = await API.post("/payment/create-payment-intent", { amount });
  return res.data;
};

