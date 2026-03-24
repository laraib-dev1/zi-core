// frontend/src/components/admin/order/OrderActions.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface OrderActionsProps {
  onView: () => void;
}

export const OrderActions: React.FC<OrderActionsProps> = ({ onView }) => {
  return (
    <div className="flex gap-2">
      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm"
        onClick={onView}
      >
        View
      </Button>
    </div>
  );
};
