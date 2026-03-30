import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

export interface FeatureServiceCardProps {
  /** Left icon (default: Rocket) */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** CTA link label (e.g. "Discover How") */
  ctaText?: string;
  ctaHref?: string;
  /** Optional top-right badge (e.g. "TOP RATED") */
  badge?: string;
  className?: string;
}

export default function FeatureServiceCard({
  icon: Icon = Rocket,
  title,
  description = "",
  ctaText = "Discover How",
  ctaHref = "#",
  badge,
  className,
}: FeatureServiceCardProps) {
  const themePrimary = "var(--theme-primary, #8B5E3C)";

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-gray-50 border border-gray-100",
        "p-5 sm:p-6 md:p-6",
        "flex items-start gap-4 sm:gap-5",
        "shadow-sm",
        className
      )}
    >
      {/* Top-right diagonal badge */}
      {badge && (
        <div
          className="absolute top-0 right-0 w-24 h-24 flex items-center justify-center overflow-hidden pointer-events-none"
          aria-hidden
        >
          <span
            className="absolute top-4 -right-10 w-32 text-[10px] font-bold uppercase tracking-wider text-white text-center"
            style={{
              backgroundColor: themePrimary,
              transform: "rotate(45deg)",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
            }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Icon: square, theme primary bg */}
      <div
        className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: themePrimary }}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>

      {/* Text + CTA */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {description}
          </p>
        )}
        {ctaText && (
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: themePrimary }}
          >
            {ctaText}
            <span aria-hidden>&gt;</span>
          </Link>
        )}
      </div>
    </div>
  );
}
