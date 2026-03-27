import React from "react";
import { Link } from "react-router-dom";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface CtaBannerProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonHref?: string;
  /** "light" = light grey bg (first CTA), "dark" = black bg (e.g. 340+ Products) */
  variant?: "light" | "dark";
  className?: string;
  onButtonClick?: () => void;
}

export default function CtaBanner({
  title,
  description,
  buttonText,
  buttonHref = "#",
  onButtonClick,
  variant = "dark",
  className,
}: CtaBannerProps) {
  const isDark = variant === "dark";
  const contentPadding = "px-3 sm:px-4 md:px-6 lg:px-8";
  return (
    <section
      className={cn(
        "w-full py-0 flex justify-center",
        className
      )}
    >
      {/* Outer: same as Container12 — padding here so inner (colored) is strictly 12-col content width */}
      <div className={cn("w-full max-w-[1232px] mx-auto py-0", contentPadding)}>
        {/* BG bar: full width of outer's content area; inner gap top and bottom */}
        <div
          className={cn(
            "w-full py-0 grid grid-cols-12 gap-6 items-center rounded-xl",
            isDark ? "bg-black text-white" : "bg-gray-200 text-gray-900",
            contentPadding,
            spacing.inner.gap
          )}
        >
          <div className="col-span-12 md:col-span-9">
            <h2 className={cn("text-xl sm:text-2xl md:text-3xl font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
              {title}
            </h2>
            {description && (
              <p className={cn("text-sm sm:text-base", isDark ? "text-gray-300" : "text-gray-600")}>{description}</p>
            )}
          </div>
          {/* <div className="col-span-12 md:col-span-3 flex md:justify-end mt-4 md:mt-0">
            <Link
              to={buttonHref}
              className={cn(
                "inline-block w-full md:w-auto text-center px-6 py-3 font-medium rounded transition-colors text-sm sm:text-base",
                isDark ? "bg-white hover:bg-gray-100 text-black" : "bg-gray-700 hover:bg-gray-800 text-white"
              )}
            >
              {buttonText}
            </Link>
          </div> */}
          <div className="col-span-12 md:col-span-3 flex md:justify-end mt-4 md:mt-0">
            {(() => {
              const href = buttonHref || "#";
              const isExternal = /^https?:\/\//i.test(href);
              const className = cn(
                "inline-block w-full md:w-auto text-center px-6 py-3 font-medium rounded transition-colors text-sm sm:text-base",
                isDark ? "bg-white hover:bg-gray-100 text-black" : "bg-gray-700 hover:bg-gray-800 text-white"
              );
              const handleClick = (e: React.MouseEvent) => {
                if (onButtonClick) {
                  e.preventDefault();
                  onButtonClick();
                }
              };
              if (isExternal) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                    {buttonText}
                  </a>
                );
              }
              return (
                <Link to={href} className={className} onClick={handleClick}>
                  {buttonText}
                </Link>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
