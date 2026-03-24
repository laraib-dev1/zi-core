import React from "react";

export default function OrderRow({ order }: any) {
  return (
    <tr className="border-b">
      <td>{order.id}</td>
      <td>{order.customer}</td>
      <td>{order.address}</td>
      <td>{order.phone}</td>
      <td>{order.items}</td>
      <td>{order.payment}</td>
      <td>{order.total}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-white text-sm ${
            order.status === "complete"
              ? "bg-green-500"
              : order.status === "in progress"
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
        >
          {order.status}
        </span>
      </td>
    </tr>
  );
}
