import React from "react";
import { cn } from "@/lib/utils";
import HeadingDivider from "./HeadingDivider";

/**
 * Reusable section header with 5 toggleable parts.
 * Use true/false to show or hide each part.
 *
 * @example
 * // Full: batch + heading + cut divider (with sides) + mini info
 * <SectionHeader showBatch showHeading showCutDivider showMiniInfo batch="Label Here" heading="About Us" miniInfo="Details" />
 *
 * @example
 * // Minimal: heading + center-only cut divider (no left/right lines)
 * <SectionHeader showHeading showCutDivider cutDividerVariant="centerOnly" heading="Section" />
 *
 * @example
 * // With bottom divider line, left-aligned, dark variant
 * <SectionHeader showHeading showCutDivider showMiniInfo showDividerLine align="left" variant="dark" />
 */

export type SectionHeaderAlign = "left" | "center";
export type SectionHeaderVariant = "light" | "dark";
export type CutDividerVariant = "withSides" | "centerOnly" | "layered";

export interface SectionHeaderProps {
  /** Show small batch/label above heading */
  showBatch?: boolean;
  /** Batch text (e.g. "Label Here") */
  batch?: string;
  /** Show main heading */
  showHeading?: boolean;
  /** Heading text */
  heading?: string;
  /** Show cut divider (decorative line below heading) */
  showCutDivider?: boolean;
  /** Cut divider: "withSides" = gray lines left+right of brown center, "centerOnly" = just brown bar, "layered" = full gray line + tan + theme primary (3D) */
  cutDividerVariant?: CutDividerVariant;
  /** Show mini info text below cut divider */
  showMiniInfo?: boolean;
  /** Mini info text */
  miniInfo?: string;
  /** Show full-width horizontal divider line at bottom */
  showDividerLine?: boolean;
  /** Alignment for all content */
  align?: SectionHeaderAlign;
  /** "light" = for light bg (dark text), "dark" = for dark bg (light text) */
  variant?: SectionHeaderVariant;
  className?: string;
}

export default function SectionHeader({
  showBatch = false,
  batch = "Label Here",
  showHeading = true,
  heading = "Section Header",
  showCutDivider = true,
  cutDividerVariant = "withSides",
  showMiniInfo = false,
  miniInfo = "Mini info section details",
  showDividerLine = false,
  align = "left",
  variant = "light",
  className,
}: SectionHeaderProps) {
  const isDark = variant === "dark";
  const isCenter = align === "center";

  const headingColor = isDark ? "text-gray-300" : "theme-heading";
  const miniInfoColor = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col gap-2",
          isCenter ? "items-center text-center" : "items-start text-left"
        )}
      >
        {showBatch && (
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-md text-xs font-medium",
              isDark
                ? "bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_70%,black)] text-amber-100"
                : "bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,transparent)]"
            )}
            style={
              !isDark ? { color: "var(--theme-primary, #8B5E3C)" } : undefined
            }
          >
            {batch}
          </span>
        )}

        {showHeading && (
          <h2
            className={cn(
              "text-xl sm:text-2xl md:text-3xl font-semibold font-['Poppins',sans-serif]",
              headingColor
            )}
          >
            {heading}
          </h2>
        )}

        {showCutDivider && (
          <div
            className={cn(
              "flex items-center mt-1 mb-1",
              isCenter ? "justify-center w-full max-w-xs mx-auto" : "justify-start w-fit"
            )}
          >
            {cutDividerVariant === "layered" ? (
              <HeadingDivider variant="layered" className={isCenter ? "mx-auto" : ""} />
            ) : cutDividerVariant === "withSides" ? (
              <HeadingDivider
                centerHeight="h-1.5"
                centerWidth="w-20"
                sideWidth="w-10"
                centerColor={undefined}
                sideColor={isDark ? "bg-gray-500/50" : "bg-gray-200"}
                className={isCenter ? "mx-auto" : ""}
              />
            ) : (
              <div
                className="h-1.5 w-16 rounded-sm shrink-0"
                style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
                role="presentation"
              />
            )}
          </div>
        )}

        {showMiniInfo && (
          <p className={cn("text-xs sm:text-sm", miniInfoColor)}>
            {miniInfo}
          </p>
        )}

        {showDividerLine && (
          <div
            className={cn("w-full mt-3 h-px", isDark ? "bg-gray-600" : "bg-gray-200")}
          />
        )}
      </div>
    </div>
  );
}
