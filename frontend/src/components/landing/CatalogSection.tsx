import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import FilterTabs from "@/components/ui/FilterTabs";
import SectionHeader from "@/components/ui/SectionHeader";
import ServicesCard from "@/components/ui/ServicesCard";
import PortfolioCard from "@/components/landing/PortfolioCard";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getBlogCategories } from "@/api/blog.api";
import PageLoader from "@/components/ui/PageLoader";

export interface CatalogSectionProps {
  catalogTypeSlug: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

function stripHtml(html: string, maxLength?: number): string {
  if (!html || typeof html !== "string") return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (maxLength && text.length > maxLength) return text.slice(0, maxLength).trim() + "...";
  return text;
}

const INITIAL_GRID_COUNT = 6;

const DEFAULT_PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  title: "Coming Soon",
  description: "Content will be added soon.",
  href: "#",
  views: 0,
}));

const SLUG_TO_DETAIL_PATH: Record<string, string> = {
  blog: "blog",
  projects: "project",
  services: "service",
  courses: "course",
};

function getDetailPath(slug: string): string {
  if (SLUG_TO_DETAIL_PATH[slug]) return SLUG_TO_DETAIL_PATH[slug];
  return `catalog/${slug}`;
}

/** Sections that keep the original card UI (ServicesCard). Blog and any new catalog type use portfolio-style cards. */
const PREVIOUS_SECTIONS_USE_SERVICES_CARD = ["services", "courses", "projects"];

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CatalogSection({
  catalogTypeSlug,
  title,
  subtitle = "Mini info section details",
  className,
}: CatalogSectionProps) {
  const [items, setItems] = useState<{
    id?: string;
    imageSrc?: string;
    title: string;
    description?: string;
    href?: string;
    views?: number;
    category?: string;
    createdAt?: string;
  }[]>([]);
  const [filters, setFilters] = useState<{ id: string; label: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getPublishedCatalogItems(catalogTypeSlug),
      getBlogCategories(catalogTypeSlug).catch(() => []),
    ])
      .then(([data, categories]) => {
        if (cancelled || !Array.isArray(data)) return;
        const categoryNames = new Set<string>();
        const mapped = data.map((row: any) => {
          const catName = row.category && (typeof row.category === "object" ? row.category.name : "") || "";
          if (catName) categoryNames.add(catName);
          return {
            id: row._id || row.id,
            imageSrc: row.image || undefined,
            title: row.title || "Untitled",
            description: stripHtml(row.description || "", 160),
            href: `/${getDetailPath(catalogTypeSlug)}/${row._id || row.id}`,
            views: row.views ?? 0,
            category: catName || undefined,
            createdAt: row.createdAt,
          };
        });
        setItems(mapped.length ? mapped : DEFAULT_PLACEHOLDERS);
        const cats = Array.from(categoryNames);
        const filterList =
          cats.length > 1
            ? [{ id: "all", label: "All" }, ...cats.map((c) => ({ id: c.toLowerCase().replace(/\s+/g, "-"), label: c }))]
            : cats.map((c) => ({ id: c.toLowerCase().replace(/\s+/g, "-"), label: c }));
        setFilters(filterList);
        setActiveFilter(filterList[0]?.id ?? "all");
      })
      .catch(() => {
        if (!cancelled) setItems(DEFAULT_PLACEHOLDERS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [catalogTypeSlug]);

  const visibleItems = items.filter((item) => {
    if (!activeFilter || activeFilter === "all") return true;
    const cat = item.category ?? "";
    const catId = String(cat).toLowerCase().replace(/\s+/g, "-");
    return catId === activeFilter;
  });

  const slugLower = String(catalogTypeSlug || "").toLowerCase();
  const isBlogSection = slugLower === "blog" || slugLower === "blogs";
  const displayedItems = isBlogSection ? visibleItems.slice(0, INITIAL_GRID_COUNT) : visibleItems;

  const showFilterTabs = filters.length > 1;
  const usePortfolioCards = !PREVIOUS_SECTIONS_USE_SERVICES_CARD.includes(catalogTypeSlug);

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-3 sm:mb-6">
          <SectionHeader
            showBatch={false}
            showHeading
            heading={title || catalogTypeSlug}
            cutDividerVariant="withSides"
            showMiniInfo
            miniInfo={subtitle}
            showCutDivider={false}
            showDividerLine={true}
            align="left"
          />
        </div>

        {showFilterTabs && (
          <div className="flex justify-center mb-3 sm:mb-8 overflow-x-auto pb-1 sm:pb-2">
            <FilterTabs tabs={filters} activeTab={activeFilter} onTabChange={setActiveFilter} />
          </div>
        )}

        {loading ? (
          <PageLoader variant="embedded" />
        ) : usePortfolioCards ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {displayedItems.map((item, i) => (
                <PortfolioCard
                  key={item.id ?? i}
                  id={String(item.id ?? i)}
                  title={item.title}
                  description={item.description || "No description"}
                  image={item.imageSrc || "/hero.png"}
                  date={formatDate(item.createdAt) || "—"}
                  niche={item.category || catalogTypeSlug}
                  views={item.views}
                  index={i}
                  inView={true}
                  to={item.href}
                />
              ))}
            </div>
            {isBlogSection && !loading && (
              <div className="flex justify-center mt-8">
                <Link
                  to="/blogs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  View More
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {visibleItems.map((item, i) => (
              <ServicesCard
                key={item.id ?? i}
                imageSrc={item.imageSrc}
                title={item.title}
                description={item.description}
                href={item.href}
                views={item.views}
              />
            ))}
          </div>
        )}
      </Container12>
    </section>
  );
}
