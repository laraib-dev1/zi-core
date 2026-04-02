import React, { useEffect, useState } from "react";
import CtaBanner from "@/components/landing/CtaBanner";
import PortfolioCard from "@/components/landing/PortfolioCard";
import Container12 from "@/components/layout/Container12";
import { spacing } from "@/utils/spacing";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getLandingSections } from "@/api/landingsection.api";
import { buildSectionContentMapFromList, contentOverride, SECTION_CONTENT_DEFAULTS } from "@/utils/landingSectionContent";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";
import { getCatalogItemPublicPath } from "@/utils/catalogPublicPaths";

function stripHtml(html: string, maxLength = 160): string {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function latestCatalogSectionHeading(catalogTypeSlug: string): string {
  const s = String(catalogTypeSlug || "").toLowerCase();
  if (s === "blog") return "Latest Blogs";
  if (s === "services") return "Latest Services";
  if (s === "projects") return "Latest Portfolios";
  if (s === "courses") return "Latest Courses";
  if (s === "applications" || s === "apps" || s === "websites") return "Latest Applications";
  const cap = s ? s.charAt(0).toUpperCase() + s.slice(1) : "Items";
  return `Latest ${cap}`;
}

export interface DetailPageLatestAndCtaProps {
  catalogTypeSlug: string;
  currentItemId: string;
  hireMeHref: string;
  /** When false, render without Container12 (parent already uses it). */
  wrapInContainer12?: boolean;
}

export default function DetailPageLatestAndCta({
  catalogTypeSlug,
  currentItemId,
  hireMeHref,
  wrapInContainer12 = true,
}: DetailPageLatestAndCtaProps) {
  const [latest, setLatest] = useState<any[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, Record<string, string>>>(() => {
    const c = getCachedData<{ contentMap?: Record<string, Record<string, string>> }>(CACHE_KEYS.LANDING_SECTIONS);
    return c?.contentMap ?? {};
  });

  useEffect(() => {
    getLandingSections()
      .then((list) => setContentMap(buildSectionContentMapFromList(list || [])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const slug = String(catalogTypeSlug || "").toLowerCase();
    const loader = getPublishedCatalogItems(slug);
    loader
      .then((list: any[]) => {
        if (cancelled || !Array.isArray(list)) return;
        const cur = String(currentItemId);
        const rest = list.filter((i: any) => String(i._id || i.id) !== cur);
        setLatest(rest.slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setLatest([]);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogTypeSlug, currentItemId]);

  const defs = SECTION_CONTENT_DEFAULTS["cta-banner-3"];
  const ctaTitle = contentOverride(contentMap, "cta-banner-3", "title", defs.title);
  const ctaDesc = contentOverride(contentMap, "cta-banner-3", "description", defs.description);
  const ctaBtn = contentOverride(contentMap, "cta-banner-3", "buttonText", defs.buttonText);

  const inner = (
    <>
      <div id="cta-banner-3" className={spacing.section.gap}>
        <CtaBanner
          layout="embedded"
          variant="dark"
          title={ctaTitle}
          description={ctaDesc}
          buttonText={ctaBtn}
          buttonHref={hireMeHref}
        />
      </div>
      {latest.length > 0 && (
        <section className={spacing.section.gap}>
          <div className="flex flex-col gap-4 md:gap-5">
            <h2 className="text-xl md:text-2xl font-semibold theme-heading m-0 shrink-0">
              {latestCatalogSectionHeading(catalogTypeSlug)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
            {latest.map((row: any, i: number) => (
              <PortfolioCard
                key={row._id || row.id || i}
                id={String(row._id || row.id || i)}
                title={row.title || "Untitled"}
                description={stripHtml(row.description || "No description")}
                image={row.image || "/hero.png"}
                date={formatDate(row.createdAt) || "—"}
                niche={
                  row.category && typeof row.category === "object"
                    ? row.category.name || catalogTypeSlug
                    : catalogTypeSlug
                }
                views={Number(row.views || 0)}
                index={i}
                inView={true}
                to={getCatalogItemPublicPath(catalogTypeSlug, String(row._id || row.id))}
              />
            ))}
            </div>
          </div>
        </section>
      )}
    </>
  );

  if (wrapInContainer12) {
    return <Container12 className={spacing.inner.gap}>{inner}</Container12>;
  }
  return <>{inner}</>;
}
