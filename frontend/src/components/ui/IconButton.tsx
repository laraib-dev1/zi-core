import React from "react";
import CircularLoader from "@/components/ui/CircularLoader";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon: React.ReactNode;
  size?: number;
}

export default function IconButton({
  loading = false,
  icon,
  size = 16,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        "p-1.5 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <CircularLoader size={size} />
      ) : (
        icon
      )}
    </button>
  );
}

