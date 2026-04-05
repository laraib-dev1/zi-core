import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ApplicationPlatformNavEntry,
  getDefaultApplicationPlatformIconPath,
} from "@/utils/applicationPlatforms";

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

const viewBtnClass =
  "rounded-md px-3 py-1.5 text-xs font-medium text-center text-white min-w-[76px] border border-[#7D7D7D]/50 bg-[#7D7D7D]/70 transition-colors hover:bg-[var(--theme-primary)] hover:border-[var(--theme-primary)]";

interface ApplicationTileCardProps {
  item: ApplicationTileData;
  viewHref?: string;
  viewLabel?: string;
  onActionClick?: () => void;
  /** Hide the primary action button (e.g. top tile on detail page where downloads live below). */
  hideActionButton?: boolean;
  compact?: boolean;
  /** From enabled setups, e.g. "Web | App | Windows" (fallback when platformLinks empty). */
  platformStatesLine?: string;
  /** Per-label links to the same detail page (preferred for hover + navigation). */
  platformLinks?: ApplicationPlatformNavEntry[];
  /** Compact tile on app detail hero: vertically center row + larger thumb for even padding. */
  compactVerticallyCenter?: boolean;
  className?: string;
}

export default function ApplicationTileCard({
  item,
  viewHref,
  viewLabel = "View",
  onActionClick,
  hideActionButton = false,
  compact = false,
  platformStatesLine,
  platformLinks,
  compactVerticallyCenter = false,
  className,
}: ApplicationTileCardProps) {
  const stars = Math.max(0, Math.min(5, Math.round(Number(item.stars || 0))));

  const thumbLg = compact && compactVerticallyCenter ? "md:h-[118px] md:w-[118px]" : "md:h-[112px] md:w-[112px]";
  const thumbSm = compact && compactVerticallyCenter ? "h-24 w-24" : "h-[88px] w-[88px]";
  const colTrack = compact && compactVerticallyCenter ? "md:grid-cols-[118px_minmax(0,1fr)]" : "md:grid-cols-[112px_minmax(0,1fr)]";

  return (
    <div
      className={cn(
        "relative grid grid-cols-1 gap-3 md:gap-4 rounded-xl border border-gray-200 bg-[#f5f6f8] p-4 md:p-5",
        colTrack,
        compact && compactVerticallyCenter ? "md:items-center items-start" : "items-start",
        className
      )}
    >
      {item.isTopRated && (
        <div
          className="absolute left-3 top-3 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          Top Rated
        </div>
      )}

      <div
        className={cn(
          "rounded-md bg-gray-200 overflow-hidden flex items-center justify-center mx-auto md:mx-0 shrink-0",
          thumbSm,
          thumbLg
        )}
      >
        {item.image ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-gray-500">APP</span>
        )}
      </div>

      <div className={cn("min-w-0 w-full", compact && compactVerticallyCenter && "md:self-center")}>
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
            compact && compactVerticallyCenter ? "sm:items-center" : "items-start"
          )}
        >
          <div className="min-w-0">
            <h3 className="text-base md:text-[26px] leading-tight font-semibold text-gray-900 break-words">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-1 min-w-0">
              {item.subTag ? (
                <>
                  {item.subTag}
                  {item.version ? ` | ${item.version}` : ""}
                </>
              ) : item.version ? (
                item.version
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end min-w-0">
            <div className="flex items-center gap-1 text-xs text-gray-500 sm:justify-end flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-3.5 w-3.5", i < stars ? "fill-fuchsia-500 text-fuchsia-500" : "text-gray-300")}
                />
              ))}
              {item.ratingCount ? <span>{item.ratingCount.toLocaleString()}</span> : null}
            </div>
            {platformLinks && platformLinks.length > 0 ? (
              <div className="flex flex-wrap items-center sm:justify-end gap-x-1 gap-y-0.5 text-sm text-gray-600">
                {platformLinks.map((p, i) => {
                  const iconSrc = getDefaultApplicationPlatformIconPath(p.typeKey);
                  return (
                    <span key={`${p.typeKey}-${p.label}-${i}`} className="inline-flex items-center gap-1">
                      {i > 0 ? <span className="mx-1 text-gray-400">|</span> : null}
                      <Link
                        to={p.href}
                        className="inline-flex items-center gap-1 transition-colors hover:text-[var(--theme-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] rounded"
                      >
                        {iconSrc ? (
                          <img src={iconSrc} alt="" className="h-4 w-4 object-contain shrink-0" aria-hidden />
                        ) : null}
                        {p.label}
                      </Link>
                    </span>
                  );
                })}
              </div>
            ) : platformStatesLine ? (
              <p className="text-sm text-gray-600 sm:text-right whitespace-normal break-words">{platformStatesLine}</p>
            ) : null}
          </div>
        </div>

        {!compact && (
          <>
            <hr className="mt-3 mb-3 w-full border-gray-300" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <p className="text-xs text-gray-500 min-w-0">
                Released: {item.releaseDate || "—"} {item.downloadsText ? `| Downloads ${item.downloadsText}` : ""}
              </p>
              <div className="flex justify-start sm:justify-end">
                {!hideActionButton &&
                  (onActionClick ? (
                    <button type="button" onClick={onActionClick} className={viewBtnClass}>
                      {viewLabel}
                    </button>
                  ) : (
                    <Link to={viewHref || "#"} className={viewBtnClass}>
                      {viewLabel}
                    </Link>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
