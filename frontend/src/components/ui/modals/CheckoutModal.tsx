import React, { useState, useEffect } from "react";
import { useCart } from "@/components/products/CartContext";
import StripeCardForm from "./StripeCardForm";
import { createOrder } from "@/api/order.api";
import { useToast } from "@/components/ui/toast";
import { getUserAddresses, addUserAddress } from "@/api/user.api";
import { useAuth } from "@/hooks/useAuth";

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Address = {
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
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, clearCart } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();
  
  // Calculate subtotal from original prices (item.price is original price)
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.price) || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Calculate total discount amount
  const discount = cartItems.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.price) || 0;
    const itemDiscount = Number(item.discount) || 0;
    if (itemDiscount === 0) return sum;
    const itemSubtotal = itemPrice * item.quantity;
    return sum + ((itemDiscount / 100) * itemSubtotal);
  }, 0);

  const total = subtotal - discount;

  const [addressType, setAddressType] = useState<"new" | "existing">("new");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    province: "",
    city: "",
    area: "",
    postalCode: "",
    phone: "",
    line1: "",
  });

  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load saved addresses from backend and localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadAddresses = async () => {
        try {
          const allAddresses: Address[] = [];
          
          // Try to load from backend first (if user is logged in)
          if (user) {
            try {
              const backendAddresses = await getUserAddresses();
              if (backendAddresses && Array.isArray(backendAddresses) && backendAddresses.length > 0) {
                allAddresses.push(...backendAddresses);
              }
            } catch (err) {
              console.warn("Failed to load addresses from backend:", err);
            }
          }
          
          // Also load from localStorage and merge (avoid duplicates)
          const savedAddresses = localStorage.getItem("savedAddresses");
          if (savedAddresses) {
            try {
              const parsedAddresses = JSON.parse(savedAddresses);
              if (Array.isArray(parsedAddresses) && parsedAddresses.length > 0) {
                // Add addresses from localStorage that don't already exist
                parsedAddresses.forEach((localAddr: Address) => {
                  const exists = allAddresses.some(
                    (addr) =>
                      addr.phone?.trim() === localAddr.phone?.trim() &&
                      addr.line1?.trim() === localAddr.line1?.trim() &&
                      addr.postalCode?.trim() === localAddr.postalCode?.trim()
                  );
                  if (!exists) {
                    allAddresses.push(localAddr);
                  }
                });
              }
            } catch (err) {
              console.error("Error loading saved addresses:", err);
            }
          }
          
          if (allAddresses.length > 0) {
            setAddresses(allAddresses);
            setSelectedAddressIndex(0);
            setAddressType("existing");
          }
        } catch (err) {
          console.error("Error loading addresses:", err);
        }
      };
      loadAddresses();
    }
  }, [isOpen, user]);

  // Save addresses to localStorage
  const saveAddressesToStorage = (addressList: Address[]) => {
    try {
      localStorage.setItem("savedAddresses", JSON.stringify(addressList));
    } catch (err) {
      console.error("Error saving addresses to localStorage:", err);
    }
  };

  // Check if address already exists (to avoid duplicates)
  const addressExists = (address: Address, addressList: Address[]): boolean => {
    if (!address || !addressList || addressList.length === 0) return false;
    
    return addressList.some(
      (addr) =>
        addr.phone?.trim() === address.phone?.trim() &&
        addr.line1?.trim() === address.line1?.trim() &&
        addr.postalCode?.trim() === address.postalCode?.trim() &&
        addr.firstName?.trim() === address.firstName?.trim() &&
        addr.lastName?.trim() === address.lastName?.trim()
    );
  };

  if (!isOpen) return null;

  // Determine which address to use
  const addressToUse =
    addressType === "existing" && selectedAddressIndex !== null
      ? addresses[selectedAddressIndex]
      : newAddress;

  const validateAddress = (): boolean => {
    const errors: Partial<Record<keyof Address, string>> = {};
    
    if (!newAddress.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!newAddress.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!newAddress.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(newAddress.phone)) {
      errors.phone = "Phone number must be 10-15 digits";
    }
    if (!newAddress.line1.trim()) {
      errors.line1 = "Address line 1 is required";
    }
    if (!newAddress.city.trim()) {
      errors.city = "City is required";
    }
    if (!newAddress.province.trim()) {
      errors.province = "Province is required";
    }
    if (!newAddress.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressSave = async () => {
    if (savingAddress) return;
    
    if (!validateAddress()) {
      error("Please fill all required fields correctly.");
      return;
    }

    setSavingAddress(true);
    try {
      // Try to save to backend first (if user is logged in)
      if (user) {
        try {
          const updatedAddresses = await addUserAddress(newAddress);
          setAddresses(updatedAddresses);
          setSelectedAddressIndex(updatedAddresses.length - 1);
          setAddressType("existing");
          setAddressErrors({});
          setNewAddress({
            firstName: "",
            lastName: "",
            province: "",
            city: "",
            area: "",
            postalCode: "",
            phone: "",
            line1: "",
          });
          success("Address saved successfully!");
          return;
        } catch (err) {
          console.warn("Failed to save address to backend:", err);
          // Fall through to localStorage save
        }
      }
      
      // Fallback to localStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if address already exists
      const updatedAddresses = [...addresses];
      if (!addressExists(newAddress, updatedAddresses)) {
        updatedAddresses.push(newAddress);
        setAddresses(updatedAddresses);
        setSelectedAddressIndex(updatedAddresses.length - 1);
        // Save to localStorage
        saveAddressesToStorage(updatedAddresses);
      } else {
        // Address already exists, just select it
        const existingIndex = updatedAddresses.findIndex(
          (addr) =>
            addr.phone === newAddress.phone &&
            addr.line1 === newAddress.line1 &&
            addr.postalCode === newAddress.postalCode
        );
        setSelectedAddressIndex(existingIndex);
      }
      
      setAddressType("existing");
      setAddressErrors({});

      setNewAddress({
        firstName: "",
        lastName: "",
        province: "",
        city: "",
        area: "",
        postalCode: "",
        phone: "",
        line1: "",
      });
      success("Address saved successfully!");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setNewAddress(prev => ({ ...prev, phone: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 w-full max-w-3xl p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 theme-heading">Checkout</h2>

        {/* 1️⃣ Order Summary */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-lg">Order Summary</h3>
          {cartItems.length === 0 ? (
            <p className="text-red-600 font-medium">
              Your cart is empty. You can still test payment with $10.
            </p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item: any) => {
                const itemPrice = Number(item.price) || 0;
                const itemDiscount = Number(item.discount) || 0;
                const itemSubtotal = itemPrice * item.quantity;
                const itemDiscountAmount = itemDiscount > 0 
                  ? (itemDiscount / 100) * itemSubtotal 
                  : 0;
                const itemTotal = itemSubtotal - itemDiscountAmount;
                
                return (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${itemTotal.toFixed(2)}</span>
                  </div>
                );
              })}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2️⃣ Address */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-lg">Billing / Shipping Address</h3>

          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value="new"
                checked={addressType === "new"}
                onChange={() => setAddressType("new")}
              />
              <span>Use new address</span>
            </label>

            {addresses.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="existing"
                  checked={addressType === "existing"}
                  onChange={() => {
                    setAddressType("existing");
                    if (selectedAddressIndex === null && addresses.length > 0) {
                      setSelectedAddressIndex(0);
                    }
                  }}
                />
                <span>Use existing address</span>
              </label>
            )}
          </div>

          {addressType === "existing" && addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((addr, index) => (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressIndex === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressIndex === index}
                    onChange={() => setSelectedAddressIndex(index)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                    <p className="text-sm text-gray-600">{addr.line1}{addr.area ? `, ${addr.area}` : ""}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.province}</p>
                    <p className="text-sm text-gray-600">Postal: {addr.postalCode}</p>
                    <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {addressType === "new" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={newAddress.firstName}
                    onChange={e => {
                      setNewAddress(prev => ({ ...prev, firstName: e.target.value }));
                      if (addressErrors.firstName) setAddressErrors(prev => ({ ...prev, firstName: undefined }));
                    }}
                    className={`border rounded-lg p-2 w-full ${addressErrors.firstName ? "border-red-500" : ""}`}
                  />
                  {addressErrors.firstName && <p className="text-red-500 text-xs mt-1">{addressErrors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={newAddress.lastName}
                    onChange={e => {
                      setNewAddress(prev => ({ ...prev, lastName: e.target.value }));
                      if (addressErrors.lastName) setAddressErrors(prev => ({ ...prev, lastName: undefined }));
                    }}
                    className={`border rounded-lg p-2 w-full ${addressErrors.lastName ? "border-red-500" : ""}`}
                  />
                  {addressErrors.lastName && <p className="text-red-500 text-xs mt-1">{addressErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Phone Number *"
                  value={newAddress.phone}
                  onChange={e => {
                    handlePhoneChange(e.target.value);
                    if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  className={`border rounded-lg p-2 w-full ${addressErrors.phone ? "border-red-500" : ""}`}
                />
                {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={newAddress.line1}
                  onChange={e => {
                    setNewAddress(prev => ({ ...prev, line1: e.target.value }));
                    if (addressErrors.line1) setAddressErrors(prev => ({ ...prev, line1: undefined }));
                  }}
                  className={`border rounded-lg p-2 w-full ${addressErrors.line1 ? "border-red-500" : ""}`}
                />
                {addressErrors.line1 && <p className="text-red-500 text-xs mt-1">{addressErrors.line1}</p>}
              </div>
              <input
                type="text"
                placeholder="Area"
                value={newAddress.area}
                onChange={e => setNewAddress(prev => ({ ...prev, area: e.target.value }))}
                className="border rounded-lg p-2 w-full"
              />
              <div>
                <input
                  type="text"
                  placeholder="City *"
                  value={newAddress.city}
                  onChange={e => {
                    setNewAddress(prev => ({ ...prev, city: e.target.value }));
                    if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: undefined }));
                  }}
                  className={`border rounded-lg p-2 w-full ${addressErrors.city ? "border-red-500" : ""}`}
                />
                {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Province *"
                  value={newAddress.province}
                  onChange={e => {
                    setNewAddress(prev => ({ ...prev, province: e.target.value }));
                    if (addressErrors.province) setAddressErrors(prev => ({ ...prev, province: undefined }));
                  }}
                  className={`border rounded-lg p-2 w-full ${addressErrors.province ? "border-red-500" : ""}`}
                />
                {addressErrors.province && <p className="text-red-500 text-xs mt-1">{addressErrors.province}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Postal Code *"
                  value={newAddress.postalCode}
                  onChange={e => {
                    setNewAddress(prev => ({ ...prev, postalCode: e.target.value }));
                    if (addressErrors.postalCode) setAddressErrors(prev => ({ ...prev, postalCode: undefined }));
                  }}
                  className={`border rounded-lg p-2 w-full ${addressErrors.postalCode ? "border-red-500" : ""}`}
                />
                {addressErrors.postalCode && <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode}</p>}
              </div>
              <button
                className="mt-2 w-full p-2 rounded text-white theme-button flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleAddressSave}
                disabled={savingAddress}
              >
                {savingAddress && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                Save Address
              </button>
            </div>
          )}
        </div>

        {/* 3️⃣ Payment Method */}
        <div className="mb-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-lg">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <span>Credit / Debit Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Payment Section */}
        {paymentMethod === "card" && (
          <StripeCardForm
            amount={total > 0 ? total : 10}
            onBeforePayment={async () => {
              // Validate address before creating order
              if (addressType === "new" && !validateAddress()) {
                throw new Error("Please fill all required address fields correctly.");
              }

              // Use the address the user selected
              const orderData = {
                customerName: `${addressToUse.firstName} ${addressToUse.lastName}`,
                address: {
                  firstName: addressToUse.firstName,
                  lastName: addressToUse.lastName,
                  line1: addressToUse.line1,
                  area: addressToUse.area,
                  city: addressToUse.city,
                  province: addressToUse.province,
                  postalCode: addressToUse.postalCode,
                  phone: addressToUse.phone,
                },
                phoneNumber: addressToUse.phone,
                items: cartItems.map(i => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                })),
                type: "Online",
                bill: total > 0 ? total : 10,
                payment: paymentMethod,
                status: "Pending",
              };

              // Create order first - this will throw if it fails
              await createOrder(orderData);
              success("Order created successfully!");
            }}
            onSuccess={async () => {
              try {
                // Only save address if it's a new address that wasn't already saved
                // Check if address already exists in the addresses list
                if (!addressExists(addressToUse, addresses)) {
                  // Save the address used in the order to backend (if user is logged in) or localStorage
                  if (user) {
                    try {
                      // Try to save to backend first
                      const updatedAddresses = await addUserAddress(addressToUse);
                      setAddresses(updatedAddresses);
                    } catch (err) {
                      console.warn("Failed to save address to backend:", err);
                      // Fallback to localStorage
                      const updatedAddresses = [...addresses];
                      updatedAddresses.push(addressToUse);
                      setAddresses(updatedAddresses);
                      saveAddressesToStorage(updatedAddresses);
                    }
                  } else {
                    // Save to localStorage for guests
                    const updatedAddresses = [...addresses];
                    updatedAddresses.push(addressToUse);
                    setAddresses(updatedAddresses);
                    saveAddressesToStorage(updatedAddresses);
                  }
                }

                clearCart();
                success("Order successfully placed!");
                onClose();
              } catch (err) {
                console.error(err);
                error("Failed to complete order. Please contact support.");
              }
            }}
          />
        )}

        {/* Cash on Delivery Section */}
        {paymentMethod === "cod" && (
          <div className="mb-4 p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-gray-700 mb-4">
              You will pay cash when the order is delivered to your address.
            </p>
            <button
              onClick={async () => {
                // Validate address
                if (addressType === "new" && !validateAddress()) {
                  error("Please fill all required address fields correctly.");
                  return;
                }

                if (placingOrder) return;

                setPlacingOrder(true);
                try {
                  // Use the address the user selected
                  const orderData = {
                    customerName: `${addressToUse.firstName} ${addressToUse.lastName}`,
                    address: {
                      firstName: addressToUse.firstName,
                      lastName: addressToUse.lastName,
                      line1: addressToUse.line1,
                      area: addressToUse.area,
                      city: addressToUse.city,
                      province: addressToUse.province,
                      postalCode: addressToUse.postalCode,
                      phone: addressToUse.phone,
                    },
                    phoneNumber: addressToUse.phone,
                    items: cartItems.map(i => ({
                      name: i.name,
                      quantity: i.quantity,
                      price: i.price,
                    })),
                    type: "Online",
                    bill: total > 0 ? total : 10,
                    payment: "Cash on Delivery",
                    status: "Pending",
                  };

                  // Create order
                  await createOrder(orderData);

                  // Only save address if it's a new address that wasn't already saved
                  if (!addressExists(addressToUse, addresses)) {
                    // Save the address used in the order to backend (if user is logged in) or localStorage
                    if (user) {
                      try {
                        const updatedAddresses = await addUserAddress(addressToUse);
                        setAddresses(updatedAddresses);
                      } catch (err) {
                        console.warn("Failed to save address to backend:", err);
                        const updatedAddresses = [...addresses];
                        updatedAddresses.push(addressToUse);
                        setAddresses(updatedAddresses);
                        saveAddressesToStorage(updatedAddresses);
                      }
                    } else {
                      const updatedAddresses = [...addresses];
                      updatedAddresses.push(addressToUse);
                      setAddresses(updatedAddresses);
                      saveAddressesToStorage(updatedAddresses);
                    }
                  }

                  clearCart();
                  success("Order successfully placed! You will pay cash on delivery.");
                  onClose();
                } catch (err: any) {
                  console.error(err);
                  error(err.message || "Failed to place order. Please try again.");
                } finally {
                  setPlacingOrder(false);
                }
              }}
              disabled={placingOrder}
              className="w-full px-4 py-3 theme-button rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {placingOrder && <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
              {placingOrder ? "Placing Order..." : "Place Order (Cash on Delivery)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
