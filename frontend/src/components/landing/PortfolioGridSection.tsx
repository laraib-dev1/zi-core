import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import PortfolioCard from "@/components/landing/PortfolioCard";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { spacing } from "@/utils/spacing";
import PageLoader from "@/components/ui/PageLoader";

const INITIAL_COUNT = 6;

const DEFAULT_PROJECT_PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => ({
  _id: `placeholder-${i}`,
  title: "Coming Soon",
  description: "<p>Content will be added soon.</p>",
  image: "",
  category: { name: "Project" },
  createdAt: new Date().toISOString(),
  views: 0,
}));

function stripHtml(html: string, maxLength?: number): string {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (maxLength && text.length > maxLength) return text.slice(0, maxLength).trim() + "...";
  return text;
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export interface PortfolioGridSectionProps {
  title?: string;
  subtitle?: string;
}

export default function PortfolioGridSection({
  title = "Portfolio",
  subtitle = "Mini info section details",
}: PortfolioGridSectionProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublishedCatalogItems("projects")
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setItems(data.length ? data : DEFAULT_PROJECT_PLACEHOLDERS);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        if (!cancelled) setItems(DEFAULT_PROJECT_PLACEHOLDERS);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const displayedItems = items.slice(0, INITIAL_COUNT);

  return (
    <section className="py-10 bg-white">
      <Container12 className={spacing.inner.gap}>
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

        {loading ? (
          <PageLoader variant="embedded" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {displayedItems.map((item, i) => {
                const categoryName =
                  item.category && typeof item.category === "object"
                    ? item.category.name
                    : item.category || "Project";
                return (
                  <PortfolioCard
                    key={item._id || item.id || i}
                    id={item._id || item.id || `item-${i}`}
                    title={item.title || "Untitled Project"}
                    description={stripHtml(item.description || "No description", 120)}
                    image={item.image || "/hero.png"}
                    date={formatDate(item.createdAt) || "—"}
                    niche={categoryName}
                    views={item.views ?? 0}
                    index={i}
                    inView={true}
                  />
                );
              })}
            </div>

            {/* View more: always visible, links to full portfolio page */}
            <div className="flex justify-center mt-8">
              <Link
                to="/portfoliopage"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                View more
              </Link>
            </div>
          </>
        )}
      </Container12>
    </section>
  );
}
