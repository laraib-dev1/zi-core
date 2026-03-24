import React from "react";

interface CircularLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function CircularLoader({ 
  size = 20, 
  color,
  className = "" 
}: CircularLoaderProps) {
  // Use theme color by default if no color is provided
  const loaderColor = color || "var(--theme-primary)";
  const borderWidth = Math.max(2, Math.floor(size / 10));
  
  return (
    <span 
      className={`inline-block animate-spin ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderWidth}px`,
        borderStyle: 'solid',
        borderColor: loaderColor,
        borderTopColor: 'transparent',
        borderRadius: '50%',
      }}
    />
  );
}

