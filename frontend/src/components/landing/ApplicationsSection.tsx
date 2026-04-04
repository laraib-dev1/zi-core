import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ApplicationTileCard from "@/components/applications/ApplicationTileCard";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getApplications } from "@/api/application.api";
import { getApplicationPlatformNavEntries, getApplicationPlatformStatesLine } from "@/utils/applicationPlatforms";
import { resolvePublicAssetUrl } from "@/utils/mediaUrl";
import PageLoader from "@/components/ui/PageLoader";

interface ApplicationsSectionProps {
  catalogTypeSlug: string;
  title?: string;
  subtitle?: string;
  /** When set, only this many tiles are shown on the landing page (full list lives on `seeMoreHref`). */
  maxItems?: number;
  /** e.g. `/applications` — shown when `maxItems` is set */
  seeMoreHref?: string;
  seeMoreLabel?: string;
  className?: string;
}

interface AppItem {
  id: string;
  title: string;
  subTag: string;
  description: string;
  image: string;
  views: number;
  createdAt: string;
  version: string;
  stars: number;
  ratingCount: number;
  topRated: boolean;
  platformStatesLine: string;
  downloadsList: unknown;
  downloadsText: string;
}

function stripHtml(html: string, maxLength = 160): string {
  const text = String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApplicationsSection({
  catalogTypeSlug,
  title = "Our Applications",
  subtitle = "Mini info section details",
  maxItems,
  seeMoreHref,
  seeMoreLabel = "See More",
  className,
}: ApplicationsSectionProps) {
  const [items, setItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (catalogTypeSlug === "applications" ? getApplications("published") : getPublishedCatalogItems(catalogTypeSlug))
      .then((rows: any[]) => {
        if (cancelled) return;
        const mapped = (Array.isArray(rows) ? rows : []).map((row: any) => {
          const rawSub =
            (typeof row.subTag === "string" && row.subTag.trim()) ||
            (typeof row.appInfo?.domain === "string" && row.appInfo.domain.trim()) ||
            "";
          return {
            id: String(row._id || row.id || ""),
            title: row.title || "Untitled Application",
            subTag: rawSub,
            description: stripHtml(row.description || "", 120),
            image: resolvePublicAssetUrl(row.image).trim() || "",
            views: Number(row.views || 0),
            createdAt: row.createdAt || "",
            version: row.appInfo?.version ? `v${row.appInfo.version}` : "",
            stars: Number(row.appInfo?.stars || 0),
            ratingCount: Number(row.appInfo?.ratingCount || 0),
            topRated: Boolean(row.appInfo?.starsEnabled && Number(row.appInfo?.stars || 0) >= 4),
            platformStatesLine: getApplicationPlatformStatesLine(row.downloadsList),
            downloadsList: row.downloadsList,
            downloadsText: String(row.appInfo?.downloadsDisplay || "").trim() || "1.2k+",
          };
        });
        setItems(mapped.filter((x) => x.id));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [catalogTypeSlug]);

  const displayedItems = useMemo(() => {
    if (maxItems != null && maxItems > 0) return items.slice(0, maxItems);
    return items;
  }, [items, maxItems]);

  const showSeeMore = Boolean(seeMoreHref && maxItems != null && maxItems > 0 && items.length > 0);

  return (
    <section id={`catalog-${catalogTypeSlug}`} className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-3 sm:mb-6">
          <SectionHeader
            showBatch={false}
            showHeading
            heading={title}
            cutDividerVariant="withSides"
            showMiniInfo
            miniInfo={subtitle}
            showCutDivider={false}
            showDividerLine={true}
            align="left"
          />
        </div>

        {showSeeMore && (
          <div className="flex justify-end mb-3 sm:mb-4">
            <Link
              to={seeMoreHref!}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              {seeMoreLabel}
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <PageLoader variant="embedded" />
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500 py-6">No applications found.</div>
          ) : (
            displayedItems.map((item) => (
              <ApplicationTileCard
                key={item.id}
                item={{
                  id: item.id,
                  title: item.title,
                  subTag: item.subTag,
                  description: item.description,
                  image: item.image,
                  releaseDate: formatDate(item.createdAt) || "—",
                  downloadsText: item.downloadsText,
                  version: item.version,
                  stars: item.stars,
                  ratingCount: item.ratingCount,
                  isTopRated: item.topRated,
                }}
                platformStatesLine={item.platformStatesLine || undefined}
                platformLinks={getApplicationPlatformNavEntries(item.downloadsList, catalogTypeSlug, item.id)}
                viewHref={`/catalog/${catalogTypeSlug}/${item.id}`}
                viewLabel="View"
              />
            ))
          )}
        </div>
      </Container12>
    </section>
  );
}
