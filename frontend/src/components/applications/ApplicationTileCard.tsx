import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ApplicationTileData {
  id: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  releaseDate?: string;
  downloadsText?: string;
  version?: string;
  stars?: number;
  ratingCount?: number;
  isTopRated?: boolean;
}

interface ApplicationTileCardProps {
  item: ApplicationTileData;
  viewHref?: string;
  viewLabel?: string;
  onActionClick?: () => void;
  /** Hide the primary action button (e.g. top tile on detail page where downloads live below). */
  hideActionButton?: boolean;
  compact?: boolean;
  className?: string;
}

export default function ApplicationTileCard({
  item,
  viewHref,
  viewLabel = "View",
  onActionClick,
  hideActionButton = false,
  compact = false,
  className,
}: ApplicationTileCardProps) {
  const stars = Math.max(0, Math.min(5, Math.round(Number(item.stars || 0))));

  return (
    <div
      className={cn(
        "relative grid grid-cols-1 md:grid-cols-[104px_minmax(0,1fr)_160px] gap-3 md:gap-4 items-center rounded-xl border border-gray-200 bg-[#f5f6f8] p-4 md:p-5",
        className
      )}
    >
      {item.isTopRated && (
        <div
          className="absolute left-0 top-0 -translate-x-2 -translate-y-2 -rotate-45 rounded px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          Top Rated
        </div>
      )}

      <div className="h-20 w-20 md:h-[104px] md:w-[104px] rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-gray-500">APP</span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="text-base md:text-[26px] leading-tight font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-600 truncate">
          {item.subTag || "Sub info of application domain"}
          {item.version ? ` | ${item.version}` : ""}
        </p>
        {!compact && (
          <hr className="mt-2 mb-2 border-gray-300" />
        )}
        {!compact && (
          <p className="mt-1 text-xs text-gray-500">
            Released: {item.releaseDate || "—"} {item.downloadsText ? `| Downloads ${item.downloadsText}` : ""}
          </p>
        )}
      </div>

      <div className="flex md:flex-col items-start md:items-end justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("h-3.5 w-3.5", i < stars ? "fill-fuchsia-500 text-fuchsia-500" : "text-gray-300")}
            />
          ))}
          {item.ratingCount ? <span>{item.ratingCount.toLocaleString()}</span> : null}
        </div>

        {!hideActionButton &&
          (onActionClick ? (
            <button
              type="button"
              onClick={onActionClick}
              className="rounded-md px-4 py-2 text-xs md:text-sm font-medium text-white min-w-[92px]"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              {viewLabel}
            </button>
          ) : (
            <Link
              to={viewHref || "#"}
              className="rounded-md px-4 py-2 text-xs md:text-sm font-medium text-center text-white min-w-[92px]"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              {viewLabel}
            </Link>
          ))}
      </div>
    </div>
  );
}
