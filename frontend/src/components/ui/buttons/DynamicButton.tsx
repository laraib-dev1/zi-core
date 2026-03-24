// components/ui/DynamicButton.tsx
import React from "react";
import clsx from "clsx";
import CircularLoader from "@/components/ui/CircularLoader";

interface DynamicButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  variant?: "filled" | "transparent";
  shape?: "rounded" | "pill" | "square";
  className?: string;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  label,
  onClick,
  loading = false,
  variant = "filled",
  shape = "rounded",
  className = "",
}) => {
  const baseClasses =
    "px-5 py-2 font-medium transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
  filled: "text-white",
  transparent: "bg-transparent border text-[var(--theme-primary)] hover:bg-[var(--theme-light)]/20",
};


  const shapes = {
    rounded: "rounded-md",
    pill: "rounded-full",
    square: "rounded-none",
  };

  const buttonStyle = variant === "filled" 
    ? { 
        backgroundColor: "var(--theme-primary)",
        borderColor: "var(--theme-primary)",
        borderWidth: "1px",
        borderStyle: "solid",
      }
    : {
        borderColor: "var(--theme-primary)",
      };

  const hoverStyle = variant === "filled"
    ? {
        onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "var(--theme-dark)";
            e.currentTarget.style.borderColor = "var(--theme-dark)";
          }
        },
        onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "var(--theme-primary)";
            e.currentTarget.style.borderColor = "var(--theme-primary)";
          }
        },
      }
    : {};

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={buttonStyle}
      {...hoverStyle}
      className={clsx(
        baseClasses,
        variants[variant],
        shapes[shape],
        variant === "transparent" && "border",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <>
          <CircularLoader size={16} color="white" />
          Loading...
        </>
      ) : (
        label
      )}
    </button>
  );
};

export default DynamicButton;
