import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServicesCardProps {
  /** Service image/icon URL. Shows placeholder if not provided */
  imageSrc?: string;
  /** View count - shown when > 0 */
  views?: number;
  /** Service title */
  title: string;
  /** Short description */
  description?: string;
  /** Link for "Learn More" (when provided, shows "Learn More →" below description) */
  href?: string;
  /** Label for the learn more link (default "Learn More") */
  learnMoreLabel?: string;
  className?: string;
}

export default function ServicesCard({
  imageSrc,
  views,
  title = "Portfolio Project Title",
  description,
  href,
  learnMoreLabel = "Learn More",
  className,
}: ServicesCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = imageSrc && !imgError;
  const showLearnMore = href != null && href !== "";

  const content = (
    <div className="flex flex-col p-4 sm:p-5">
      {/* Icon/Image placeholder - 1:1 aspect ratio, top */}
      <div className="w-16 sm:w-20 aspect-square rounded-lg bg-gray-200 flex items-center justify-center mb-4 overflow-hidden shrink-0">
        {showImage ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        )}
      </div>

      <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {description}
        </p>
      )}

      {/* Learn More link - after text, with arrow */}
      {showLearnMore && (
        <Link
          to={href!}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 mt-auto pt-1 transition-colors group-hover:text-[var(--theme-primary)]"
        >
          {learnMoreLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  const cardClass = cn(
    "group block rounded-lg bg-gray-50 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow",
    className
  );

  return <div className={cardClass}>{content}</div>;
}
