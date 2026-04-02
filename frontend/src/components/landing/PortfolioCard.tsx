// src/components/ui/PortfolioCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface PortfolioCardProps {
  id: string;
  title?: string;
  description: string;
  image?: string;
  date: string;
  niche: string;
  views?: number;
  inView?: boolean;
  index?: number;
  /** Override detail link (e.g. /blog/123). When not set, uses /project/{id}. */
  to?: string;
  /** 1:1 image area (e.g. Latest Applications on detail pages). */
  squareImage?: boolean;
}

export default function PortfolioCard({
  id,
  title,
  description,
  image,
  date,
  niche,
  views,
  inView = true,
  index = 0,
  to,
  squareImage = false,
}: PortfolioCardProps) {
  const href = to ?? `/project/${id}`;
  return (
    <div
      className={cn(
        "transition-all duration-600 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={inView ? { transitionDelay: `${100 + index * 80}ms` } : undefined}
    >
      <Link to={href} className="group cursor-pointer block">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div
            className={cn(
              "relative w-full bg-gray-100 overflow-hidden",
              squareImage ? "aspect-square" : "aspect-16/9"
            )}
          >
            <img
              src={image || "/hero.png"}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/hero.png";
              }}
            />
          </div>
          <div className="px-1 py-1 sm:p-2">
            {title && (
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                {title}
              </h3>
            )}
            <p className="text-xs sm:text-sm text-gray-900 mb-2 line-clamp-2 min-h-2.5rem">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span
                className="inline-block px-2 py-1 bg-gray-100 text-xs rounded"
                style={{ color: "var(--theme-primary, #8B5E3C)" }}
              >
                {niche}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500">{date}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}