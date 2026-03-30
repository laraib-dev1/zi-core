import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";

export interface UnlockPotentialSectionProps {
  heading?: string;
  description?: string;
  /** Primary button (e.g. "Get Started Now") */
  primaryButtonText?: string;
  primaryButtonHref?: string;
  /** Secondary button (e.g. "Learn More") */
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  /** Bottom illustration/image – add your image; leave empty for placeholder */
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

/** Image area aspect ratio 16:9 */
const IMAGE_ASPECT_RATIO = 16 / 9;

export default function UnlockPotentialSection({
  heading = "Unlock Your Full Potential Today!",
  description = "Join thousands of satisfied customers who have transformed their lives with our innovative solutions.",
  primaryButtonText = "Get Started Now",
  primaryButtonHref = "#",
  secondaryButtonText = "Learn More",
  secondaryButtonHref = "#",
  imageSrc,
  imageAlt = "Illustration",
  className,
}: UnlockPotentialSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <Container12 grid gap="gap-6">
        {/* Card wrapper: 12 cols, inner 12-col grid */}
        <div className="col-span-12 rounded-2xl overflow-hidden bg-gray-50 p-5 sm:p-6 md:p-8 lg:p-10 grid grid-cols-12 gap-4 sm:gap-6">
          <h2 className="col-span-12 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 max-w-2xl mx-auto text-center">
            {heading}
          </h2>
          <p className="col-span-12 text-sm sm:text-base text-gray-600 max-w-xl mx-auto text-center">
            {description}
          </p>

          <div className="col-span-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={primaryButtonHref}
              className="inline-block px-6 py-3 rounded-lg font-medium text-white text-sm sm:text-base hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--theme-primary, #ea580c)" }}
            >
              {primaryButtonText}
            </Link>
            <Link
              to={secondaryButtonHref}
              className="inline-block px-6 py-3 rounded-lg font-medium text-gray-800 border-2 border-gray-800 text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              {secondaryButtonText}
            </Link>
          </div>

          {/* Image area – col-span-12, same size as design (~2.4:1) */}
          <div
            className="col-span-12 w-full overflow-hidden rounded-lg bg-gray-200"
            style={{ aspectRatio: IMAGE_ASPECT_RATIO }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                aria-hidden
              >
                Image placeholder
              </div>
            )}
          </div>
        </div>
      </Container12>
    </section>
  );
}
