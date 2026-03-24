import React from "react";

type OrderStatus = "cancel" | "cancelled" | "pending" | "completed" | "complete" | "returned" | "Returned";
type ProductStatus = "active" | "inactive";
type QueryStatus = "read" | "pending" | "replied";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "product" | "query";
}

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().trim();

  const getStatusStyles = () => {
    if (type === "order") {
      const orderStatus = normalizedStatus as OrderStatus;
      switch (orderStatus) {
        case "completed":
        case "complete":
          return "bg-green-100 text-green-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "cancel":
        case "cancelled":
          return "bg-red-100 text-red-800";
        case "returned":
          return "bg-orange-100 text-orange-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    if (type === "product") {
      const productStatus = normalizedStatus as ProductStatus;
      switch (productStatus) {
        case "active":
          return "bg-green-100 text-green-800";
        case "inactive":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    if (type === "query") {
      const queryStatus = normalizedStatus as QueryStatus;
      switch (queryStatus) {
        case "read":
          return "bg-blue-100 text-blue-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "replied":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    return "bg-gray-100 text-gray-800";
  };

  const getDisplayText = () => {
    if (type === "order") {
      const orderStatus = normalizedStatus as OrderStatus;
      switch (orderStatus) {
        case "completed":
        case "complete":
          return "Completed";
        case "pending":
          return "Pending";
        case "cancel":
        case "cancelled":
          return "Cancelled";
        case "returned":
          return "Returned";
        default:
          return status;
      }
    }

    if (type === "product") {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }

    if (type === "query") {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }

    return status;
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {getDisplayText()}
    </span>
  );
}

