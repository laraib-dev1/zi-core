import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type HelpBannerVariant = "banner" | "card";

export interface HelpBannerProps {
  title: string;
  description: string;
  /** "banner" = full-width theme primary bar (default); "card" = light grey rounded card with pill button */
  variant?: HelpBannerVariant;
  /** Button label (only used when variant="card") */
  buttonText?: string;
  /** Button link (only used when variant="card") */
  buttonHref?: string;
  className?: string;
}

export default function HelpBanner({
  title,
  description,
  variant = "banner",
  buttonText = "Request a Free Quote",
  buttonHref = "#",
  className,
}: HelpBannerProps) {
  if (variant === "card") {
    return (
      <section className={cn("w-full theme-bg-accent", className)}>
        <div className="w-full max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div
            className="w-full rounded-2xl text-center pt-6 pb-6 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 theme-bg-accent"
          >
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 max-w-2xl mx-auto"
              style={{ color: "var(--theme-primary, #8B5E3C)" }}
            >
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-6">
              {description}
            </p>
            <Link
              to={buttonHref}
              className="inline-block px-8 py-3 rounded-full font-medium text-white text-sm sm:text-base hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("w-full", className)}>
      <div className="w-full max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div
          className={cn(
            "w-full rounded-xl text-center text-white pt-10 pb-10 md:pt-14 md:pb-14 px-4 sm:px-6 relative overflow-hidden"
          )}
          style={{
            backgroundColor: "var(--theme-primary, #8B5E3C)",
            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-white/95 max-w-3xl mx-auto">{description}</p>
        </div>
      </div>
    </section>
  );
}
