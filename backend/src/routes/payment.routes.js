import express from "express";
import Stripe from "stripe";

const router = express.Router();

let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_placeholder") {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

router.post("/create-payment-intent", async (req, res) => {
  console.log("Body received:", req.body);
  console.log("Stripe initialized:", !!stripe);

  if (!stripe) {
    return res.status(400).send({ error: "Stripe API key not configured yet." });
  }

  const { amount } = req.body;
  console.log("Amount received:", amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});


export default router;
