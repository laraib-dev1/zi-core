import { cn } from "@/lib/utils";

export default function OrderStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    paid: "bg-green-100 text-green-600",
    pending: "bg-yellow-100 text-yellow-600",
    cancelled: "bg-red-100 text-red-600",
    refunded: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-sm font-medium capitalize",
        colorMap[status] || "bg-gray-100 text-gray-600"
      )}
    >
      {status}
    </span>
  );
}
