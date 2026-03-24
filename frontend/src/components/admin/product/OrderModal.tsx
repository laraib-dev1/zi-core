import React, { useState, useEffect } from "react";
import { Order } from "@/types/Order";
import { updateOrderStatus, getOrderById } from "@/api/order.api";
import { useToast } from "@/components/ui/toast";

interface OrderModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ order, open, onClose, onUpdate }) => {
  const { success, error } = useToast();
  const [status, setStatus] = useState(order?.status || "Pending");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [loading, setLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [fetchingOrder, setFetchingOrder] = useState(false);

  // Fetch fresh order data when modal opens
  useEffect(() => {
    if (open && order?._id) {
      setFetchingOrder(true);
      getOrderById(order._id)
        .then((freshOrder) => {
          setCurrentOrder(freshOrder);
          setStatus(freshOrder.status || "Pending");
        })
        .catch((err) => {
          console.error("Failed to fetch fresh order data:", err);
          // Fallback to prop order if fetch fails
          setCurrentOrder(order);
          setStatus(order?.status || "Pending");
        })
        .finally(() => {
          setFetchingOrder(false);
        });
    } else if (order) {
      setCurrentOrder(order);
      setStatus(order.status || "Pending");
    }
  }, [open, order?._id]); // Re-fetch when modal opens or order ID changes

  if (!open || !currentOrder) return null;

  const handleSave = async () => {
    if (loading) return;
    
    if (!status) {
      setStatusError("Status is required");
      return;
    }
    
    setLoading(true);
    setStatusError("");
    try {
      await updateOrderStatus(currentOrder._id, status);
      success("Order status updated successfully!");
      onUpdate(); 
      onClose();
    } catch (err) {
      console.error(err);
      error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 text-black">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 theme-heading text-gray-900">Order Details</h2>

        {fetchingOrder ? (
          <div className="text-center py-4">
            <p className="text-gray-900">Loading order details...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-900"><strong>Customer:</strong> {currentOrder.customerName}</p>
            <p className="text-gray-900"><strong>Phone:</strong> {currentOrder.phoneNumber}</p>
            <p className="text-gray-900">
              <strong>Address:</strong>{" "}
              {currentOrder.address
                ? `${currentOrder.address.line1 || ""}${currentOrder.address.area ? ", " + currentOrder.address.area : ""}, ${currentOrder.address.city || ""}, ${currentOrder.address.province || ""}, ${currentOrder.address.postalCode || ""}`
                : "No address provided"}
            </p>
            <p className="text-gray-900"><strong>Items:</strong> {currentOrder.items.map(i => `${i.name} x ${i.quantity}`).join(", ")}</p>
            <p className="text-gray-900"><strong>Bill:</strong> ${currentOrder.bill}</p>
            <p className="text-gray-900"><strong>Payment:</strong> {currentOrder.payment}</p>
            <p className="text-gray-900"><strong>Order Date:</strong> {new Date(currentOrder.createdAt).toLocaleString()}</p>
            
            {/* Show cancellation info if order was cancelled */}
            {(() => {
              const isCancelled = currentOrder.status === "Cancelled" || 
                                  currentOrder.status === "Cancel" || 
                                  currentOrder.status?.toLowerCase() === "cancelled" || 
                                  currentOrder.status?.toLowerCase() === "cancel";
              
              if (isCancelled) {
                const cancelledBy = (currentOrder as any).cancelledBy;
                const cancelledAt = (currentOrder as any).cancelledAt;
                const userId = (currentOrder as any).userId;
                
                // If cancelledBy is not set but order has userId, it was likely cancelled by user
                // (since only users can cancel through frontend, admin cancels through admin panel)
                const whoCancelled = cancelledBy 
                  ? (cancelledBy === "user" ? "Customer" : "Admin")
                  : (userId ? "Customer" : "Unknown");
                
                return (
                  <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          Cancelled by: <span className="font-bold">{whoCancelled}</span>
                        </p>
                        {cancelledAt && (
                          <p className="text-xs text-red-700 mt-1">
                            Cancelled on: {new Date(cancelledAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}

        <div className="mt-4">
          <label className="block mb-1 text-gray-900">Status:</label>
          <select 
            value={status} 
            onChange={e => {
              setStatus(e.target.value);
              if (statusError) setStatusError("");
            }} 
            className={`border rounded p-2 w-full text-black ${statusError ? "border-red-500" : ""}`}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--theme-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
          {statusError && <p className="text-red-500 text-xs mt-1">{statusError}</p>}
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button className="px-4 h-12 bg-gray-200 rounded text-black" onClick={onClose} disabled={loading}>Close</button>
          <button 
            className="px-4 h-12 text-white rounded theme-button flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
