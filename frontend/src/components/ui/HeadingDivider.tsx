import React from "react";
import { cn } from "@/lib/utils";

export type HeadingDividerVariant = "default" | "layered";

export interface HeadingDividerProps {
  /** "default" = side bars + center bar; "layered" = full-width gray line + tan bar + theme primary bar (3D) */
  variant?: HeadingDividerVariant;
  /** Thickness of the center bar (e.g. "h-1", "h-1.5") */
  centerHeight?: string;
  /** Width of the center bar (e.g. "w-16", "w-24") */
  centerWidth?: string;
  /** Width of the side (left/right) bars - default half of center */
  sideWidth?: string;
  /** Center bar color - default theme brown */
  centerColor?: string;
  /** Side bars color - default light gray */
  sideColor?: string;
  className?: string;
}

/** Layered divider: full-width dark gray line, centered tan bar, centered theme-primary bar with subtle 3D */
function LayeredDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full flex flex-col items-center justify-center", className)} role="presentation">
      {/* Full-width dark gray line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#8B8B8B]" />
      {/* Centered stack: tan bar then theme primary bar */}
      <div className="relative flex flex-col items-center gap-0">
        {/* Top accent: light tan bar */}
        <div className="h-1 w-24 rounded-sm bg-[#DDC199] shrink-0" />
        {/* Bottom accent: theme primary, thicker, slight 3D */}
        <div
          className="h-2 w-20 rounded-sm shrink-0 -mt-0.5"
          style={{
            backgroundColor: "var(--theme-primary, #8B5E3C)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}

export default function HeadingDivider({
  variant = "default",
  centerHeight = "h-1.5",
  centerWidth = "w-20",
  sideWidth = "w-10",
  centerColor,
  sideColor = "bg-gray-200",
  className,
}: HeadingDividerProps) {
  if (variant === "layered") {
    return <LayeredDivider className={className} />;
  }

  return (
    <div className={cn("flex items-center justify-center w-full gap-0", className)} role="presentation">
      <div className={cn("shrink-0 rounded-l-sm", sideColor, "h-0.5", sideWidth)} />
      <div
        className={cn("shrink-0", centerHeight, centerWidth)}
        style={{ backgroundColor: centerColor ?? "var(--theme-primary, #8B5E3C)" }}
      />
      <div className={cn("shrink-0 rounded-r-sm", sideColor, "h-0.5", sideWidth)} />
    </div>
  );
}
