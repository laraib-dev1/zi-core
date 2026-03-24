import React from "react";
import { cn } from "@/lib/utils";

/** Same max-width and padding as other content (AboutHero, etc.) for 12-col alignment */
const CONTENT_MAX_WIDTH = "max-w-[1232px]";
const CONTENT_PADDING = "px-3 sm:px-4 md:px-6 lg:px-8";

export interface Container12Props {
  children: React.ReactNode;
  /** When true, content is a 12-column grid (use col-span-* on children) */
  grid?: boolean;
  /** Grid gap, e.g. gap-4, gap-6 */
  gap?: string;
  className?: string;
}

export default function Container12({
  children,
  grid = false,
  gap = "gap-6",
  className,
}: Container12Props) {
  return (
    <div
      className={cn(
        CONTENT_MAX_WIDTH,
        "mx-auto",
        CONTENT_PADDING,
        grid && `grid grid-cols-12 ${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}

export { CONTENT_MAX_WIDTH, CONTENT_PADDING };
