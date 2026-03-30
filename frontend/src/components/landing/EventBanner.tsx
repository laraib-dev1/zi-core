import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";

export interface EventBannerProps {
  /** Short month label (e.g. "OCT") */
  month?: string;
  /** Day number (e.g. 28) */
  day?: number;
  /** Event title (e.g. "Open Campus Day") */
  title?: string;
  /** Event description */
  description?: string;
  /** Button label */
  buttonText?: string;
  /** Button link */
  buttonHref?: string;
  className?: string;
}

const DEFAULT_DESCRIPTION =
  "Experience our vibrant campus life, meet faculty members, and learn about our academic programs.";

export default function EventBanner({
  month = "OCT",
  day = 28,
  title = "Open Campus Day",
  description = DEFAULT_DESCRIPTION,
  buttonText = "Register",
  buttonHref = "#",
  className,
}: EventBannerProps) {
  return (
    <section
      className={cn("w-full py-10 sm:py-12 md:py-14 theme-bg-accent", className)}
    >
      <Container12 grid gap="gap-4 sm:gap-6" className="items-center py-4 sm:py-6 md:py-8 px-2 sm:px-0">
          {/* Date block - theme primary bg, square, no space between month and date */}
          <div
            className="col-span-12 sm:col-span-3 md:col-span-2 flex flex-col items-center justify-center gap-0 rounded-xl py-2 px-3 shrink-0 w-fit aspect-square min-w-0"
            style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
          >
            <span className="text-white/95 text-[10px] font-medium uppercase tracking-wider leading-none">
              {month}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white leading-none">
              {day}
            </span>
          </div>

          {/* Event details - top/bottom padding */}
          <div className="col-span-12 sm:col-span-6 md:col-span-8 min-w-0 pt-2 pb-2 sm:pt-4 sm:pb-4">
            <h2
              className="text-lg sm:text-xl md:text-2xl font-semibold mb-1"
              style={{ color: "var(--theme-primary, #8B5E3C)" }}
            >
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-700">{description}</p>
          </div>

          {/* Register button */}
          <div className="col-span-12 sm:col-span-3 md:col-span-2 flex sm:justify-end">
            <Link
              to={buttonHref}
              className="inline-block w-full sm:w-auto text-center px-6 py-3 rounded-lg font-medium text-sm sm:text-base text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
            >
              {buttonText}
            </Link>
          </div>
        </Container12>
    </section>
  );
}
