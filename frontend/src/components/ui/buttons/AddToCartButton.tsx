import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/components/products/CartContext";
import CircularLoader from "@/components/ui/CircularLoader";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    discount?: number; 
    image?: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    addToCart({ ...product, quantity: 1 });

    await new Promise((res) => setTimeout(res, 500));

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full md:w-auto px-8 text-white font-semibold h-12 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      style={{
        backgroundColor: "var(--theme-primary)",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = "var(--theme-dark)";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = "var(--theme-primary)";
        }
      }}
    >
      {loading ? (
        <>
          <CircularLoader size={20} color="white" />
          Processing...
        </>
      ) : (
        "Add to Purchase"
      )}
    </button>
  );
}
