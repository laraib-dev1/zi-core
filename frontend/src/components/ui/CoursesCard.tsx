import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoursesCardProps {
  /** Course image URL. Shows placeholder if not provided */
  imageSrc?: string;
  /** View count - shown when > 0 */
  views?: number;
  /** Category/tag label */
  category?: string;
  /** Price display (e.g. "Rs: 12,000") */
  price?: string;
  /** Course title */
  title: string;
  /** Short description */
  description?: string;
  /** Optional link - when provided, card is wrapped in Link */
  href?: string;
  className?: string;
}

export default function CoursesCard({
  imageSrc,
  views,
  category = "Categorie",
  price = "Rs: 12,000",
  title = "Portfolio Project Title",
  description,
  href,
  className,
}: CoursesCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = imageSrc && !imgError;
  const accentColor = "var(--theme-primary, #8B5E3C)";

  const content = (
    <>
      {/* Image section - 16:9 aspect ratio */}
      <div className="relative w-full aspect-16/9 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-105">
          {showImage ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Content section */}
      <div 
      className="px-1 py-1 sm:p-2 bg-white rounded-b-lg"
      >
        {/* px-4 py-3 sm:p-5*/}
        {/* Category + Price row */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span
            className="text-xs font-medium sm:px-3 sm:py-1 sm:rounded-full sm:bg-[rgba(237,201,175,0.6)]"
            style={{color: accentColor }}
          >
            {category}
          </span>
          <span
            className="text-sm font-medium shrink-0"
            style={{ color: accentColor }}
          >
            {price}
          </span>
        </div>
        {/* Title */}
        {/* <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-1 sm:line-clamp-2">
          {title}
        </h3> */}
        <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1 sm:line-clamp-2">
  {title}
</h3>

        {/* Description */}
        {description && (
          // <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          //   {description}
          // </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-normal line-clamp-2">
  {description}
</p>
        )}
      </div>
    </>
  );

  const cardClass = cn(
    "block rounded-xl bg-white overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group",
    className
  );

  if (href) {
    return (
      <Link to={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
