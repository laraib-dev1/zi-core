import React, { useState, useEffect } from "react";
import Container12 from "@/components/layout/Container12";
import FilterTabs from "@/components/ui/FilterTabs";
import SectionHeader from "@/components/ui/SectionHeader";
import CoursesCard from "@/components/ui/CoursesCard";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { getPublishedCatalogItems } from "@/api/blog.api";
import PageLoader from "@/components/ui/PageLoader";

export interface CourseItem {
  id?: string;
  imageSrc?: string;
  category?: string;
  price?: string;
  title: string;
  description?: string;
  href?: string;
  views?: number;
}

export interface CoursesSectionProps {
  title?: string;
  subtitle?: string;
  filters?: { id: string; label: string }[];
  items?: CourseItem[];
  className?: string;
}

const defaultFilters: { id: string; label: string }[] = [];

const defaultPlaceholders: CourseItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `course-${i}`,
  category: "Category",
  price: "Rs: 12,000",
  title: "Portfolio Project Title",
  description: "Lorem ipsum formatted dolor sit amet, consectetur adipiscing elit.",
  href: `/course/course-${i}`,
}));

function stripHtml(html: string, maxLength?: number): string {
  if (!html || typeof html !== "string") return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (maxLength && text.length > maxLength) return text.slice(0, maxLength).trim() + "...";
  return text;
}

export default function CoursesSection({
  title = "Courses",
  subtitle = "Mini info section details",
  filters: filtersProp,
  items: itemsProp,
  className,
}: CoursesSectionProps) {
  const [items, setItems] = useState<CourseItem[]>(itemsProp ?? defaultPlaceholders);
  const [filters, setFilters] = useState<{ id: string; label: string }[]>(filtersProp ?? defaultFilters);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(!itemsProp);

  useEffect(() => {
    if (itemsProp !== undefined) {
      setItems(itemsProp);
      if (filtersProp) setFilters(filtersProp);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPublishedCatalogItems("courses")
      .then((data: any[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const categoryNames = new Set<string>();
        const mapped: CourseItem[] = data.map((row: any) => {
          const catName = row.category && (typeof row.category === "object" ? row.category.name : "") || "";
          if (catName) categoryNames.add(catName);
          return {
            id: row._id || row.id,
            imageSrc: row.image || undefined,
            category: catName || undefined,
            price: row.subTag || "Rs: 12,000",
            title: row.title || "Untitled Course",
            description: stripHtml(row.description || "", 160),
            href: `/course/${row._id || row.id}`,
            views: row.views ?? 0,
          };
        });
        setItems(mapped.length ? mapped : defaultPlaceholders);
        const categoryFilters = Array.from(categoryNames).map((c) => ({ id: c.toLowerCase().replace(/\s+/g, "-"), label: c }));
        const filterList =
          categoryFilters.length > 1
            ? [{ id: "all", label: "All" }, ...categoryFilters]
            : categoryFilters;
        setFilters(filterList);
        setActiveFilter(filterList[0]?.id ?? "");
      })
      .catch(() => {
        if (!cancelled) setItems(defaultPlaceholders);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemsProp]);

  const visibleItems = items.filter((item) => {
    if (!activeFilter || activeFilter === "all") return true;
    const cat = (item.category ?? "").toLowerCase().replace(/\s+/g, "-");
    return cat === activeFilter;
  });

  const showFilterTabs = filters.length > 1;

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-3 sm:mb-6">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={subtitle}
            showDividerLine={true}
            align="left"
          />
        </div>

        {showFilterTabs && (
          <div className="flex justify-center mb-3 sm:mb-8 overflow-x-auto pb-1 sm:pb-2">
            <FilterTabs
              tabs={filters}
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
            />
          </div>
        )}

        {loading ? (
          <PageLoader variant="embedded" />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {visibleItems.map((item, i) => (
            <CoursesCard
              key={item.id ?? i}
              imageSrc={item.imageSrc}
              category={item.category}
              price={item.price}
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
