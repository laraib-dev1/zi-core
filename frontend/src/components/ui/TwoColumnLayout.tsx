// components/ui/TwoColumnLayout.tsx
import React from "react";

interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  reverse?: boolean; // if true, swaps left and right
  className?: string;
  gap?: string; // Tailwind gap class, default "gap-8"
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  reverse = false,
  className = "",
  gap = "gap-8",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row ${gap} ${className} ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-1">{left}</div>
      <div className="flex-1">{right}</div>
    </div>
  );
};

export default TwoColumnLayout;
