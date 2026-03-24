import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { createPaymentIntent } from "@/api/payment.api";
import { useToast } from "@/components/ui/toast";

const StripeCardForm = ({ 
  amount, 
  onSuccess, 
  onBeforePayment 
}: { 
  amount: number; 
  onSuccess: () => void;
  onBeforePayment?: () => Promise<void>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // First, create the order (if callback provided)
      if (onBeforePayment) {
        await onBeforePayment();
      }

      // Then, process payment
      const res = await createPaymentIntent(Math.round(amount * 100));
      const clientSecret = res.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      });

      if (result.error) {
        error(result.error.message || "Payment failed");
      } else if (result.paymentIntent.status === "succeeded") {
        success("Payment Successful!");
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Card Number</label>
        <div className="p-3 border rounded-lg">
          <CardNumberElement
            options={{
              style: { base: { fontSize: "16px", color: "#333" } },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Expiry</label>
          <div className="p-3 border rounded-lg">
            <CardExpiryElement
              options={{
                style: { base: { fontSize: "16px", color: "#333" } },
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">CVC</label>
          <div className="p-3 border rounded-lg">
            <CardCvcElement
              options={{
                style: { base: { fontSize: "16px", color: "#333" } },
              }}
            />
          </div>
        </div>
      </div>

      <button
        className="w-full mt-4 text-white py-3 rounded-lg theme-button flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
        Pay Now
      </button>
    </div>
  );
};

export default StripeCardForm;
