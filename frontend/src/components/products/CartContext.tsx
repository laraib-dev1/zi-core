import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  discount?: number;
};

type CartContextType = {
  cartItems: CartItem[];
  totalItems: number; // ✅ total items in cart
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void; 
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// Get user-specific cart key
const getCartKey = (): string => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return `cartItems_${user.id}`;
    }
  } catch (err) {
    console.warn("Failed to get user ID for cart", err);
  }
  return "cartItems_guest"; // Fallback for guests
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const cartKey = getCartKey();
    const stored = localStorage.getItem(cartKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Save cartItems to localStorage whenever it changes (user-specific)
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems]);

  // Reload cart when user changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const cartKey = getCartKey();
      const stored = localStorage.getItem(cartKey);
      setCartItems(stored ? JSON.parse(stored) : []);
    };

    // Listen for user changes
    window.addEventListener("storage", handleStorageChange);
    // Also check on focus (in case user logged in/out in another tab)
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCartItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
      )
    );
  };

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const clearCart = () => {
    setCartItems([]); // empties the cart
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems, // ✅ provide totalItems to context
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
