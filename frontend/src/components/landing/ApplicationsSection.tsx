import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getApplications } from "@/api/application.api";

interface ApplicationsSectionProps {
  catalogTypeSlug: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface AppItem {
  id: string;
  title: string;
  subTag: string;
  description: string;
  image: string;
  tags: string[];
  views: number;
  createdAt: string;
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

const FALLBACK_FILTERS = ["all", "ai", "windows", "android", "web"];

export default function ApplicationsSection({
  catalogTypeSlug,
  title = "Our Applications",
  subtitle = "Mini info section details",
  className,
}: ApplicationsSectionProps) {
  const [items, setItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (catalogTypeSlug === "applications" ? getApplications("published") : getPublishedCatalogItems(catalogTypeSlug))
      .then((rows: any[]) => {
        if (cancelled) return;
        const mapped = (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row._id || row.id || ""),
          title: row.title || "Untitled Application",
          subTag: row.subTag || "Sub info of application domain",
          description: stripHtml(row.description || "", 120),
          image: row.image || "",
          tags: Array.isArray(row.tags) ? row.tags.filter(Boolean).map((t: string) => t.toLowerCase()) : [],
          views: Number(row.views || 0),
          createdAt: row.createdAt || "",
        }));
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

  const filters = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((t) => tagSet.add(t)));
    const dynamic = Array.from(tagSet);
    const merged = Array.from(new Set([...FALLBACK_FILTERS, ...dynamic]));
    return merged.map((id) => ({ id, label: id === "all" ? "All" : id[0].toUpperCase() + id.slice(1) }));
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.tags.includes(activeFilter));
  }, [items, activeFilter]);

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

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-3 py-1 text-xs rounded-md border transition-colors",
                activeFilter === f.id
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
              style={activeFilter === f.id ? { backgroundColor: "var(--theme-primary)" } : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))
          ) : visibleItems.length === 0 ? (
            <div className="text-sm text-gray-500 py-6">No applications found for this filter.</div>
          ) : (
            visibleItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[72px_minmax(0,1fr)_auto] items-start sm:items-center gap-3 rounded-xl border border-gray-200 bg-[#f7f8fa] px-3 py-3"
              >
                <div className="h-16 w-16 sm:h-14 sm:w-14 rounded-md bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-500">APP</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">{item.subTag}</div>
                  <div className="mt-1 text-[11px] text-gray-500 truncate">
                    {item.description || "Application details managed from Admin Catalog content."}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">
                    Released: {formatDate(item.createdAt) || "—"} | Downloads {item.views > 0 ? `${item.views}` : "1.2k+"}
                  </div>
                </div>

                <Link
                  to={`/catalog/${catalogTypeSlug}/${item.id}`}
                  className="justify-self-start sm:justify-self-end shrink-0 min-w-[92px] text-center rounded-md px-3 py-2 text-xs text-white"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </Container12>
    </section>
  );
}
