import React, { useEffect, useState, useRef } from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ServicesCard from "@/components/ui/ServicesCard";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { getPublishedCatalogItems } from "@/api/blog.api";
import PageLoader from "@/components/ui/PageLoader";

export interface ServiceItem {
  id?: string;
  imageSrc?: string;
  title: string;
  description?: string;
  href?: string;
  views?: number;
}

export interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
  /** If provided, used instead of fetching (e.g. for static pages) */
  items?: ServiceItem[];
  className?: string;
}

const defaultPlaceholders: ServiceItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `service-${i}`,
  title: "Portfolio Project Title",
  description:
    "Lorem ipsum formatted dolor sit amet, consectetur adipiscing elit. Duis id How about if I sleep a little bit, To an English person.",
  href: `/service/service-${i}`,
}));

function stripHtml(html: string, maxLength?: number): string {
  if (!html || typeof html !== "string") return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (maxLength && text.length > maxLength) return text.slice(0, maxLength).trim() + "...";
  return text;
}

export default function ServicesSection({
  title = "Services",
  subtitle = "Mini info section details",
  items: itemsProp,
  className,
}: ServicesSectionProps) {
  const [items, setItems] = useState<ServiceItem[]>(itemsProp ?? defaultPlaceholders);
  const [loading, setLoading] = useState(!itemsProp);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    let timer: number | undefined;

    const isMobile = window.innerWidth < 640;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          timer = window.setTimeout(() => {
            setInView(true);
            if (el) observer.unobserve(el);
          }, 300); // show content quickly (~0.3s delay)
        }
      },
      {
        threshold: isMobile ? 0.35 : 0.6, // trigger a bit earlier on small screens
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (itemsProp !== undefined) {
      setItems(itemsProp);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPublishedCatalogItems("services")
      .then((data: any[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const mapped: ServiceItem[] = data.map((row: any) => ({
          id: row._id || row.id,
          imageSrc: row.image || undefined,
          title: row.title || "Untitled Service",
          description: stripHtml(row.description || "", 160),
          href: `/service/${row._id || row.id}`,
          views: row.views ?? 0,
        }));
        setItems(mapped.length ? mapped : defaultPlaceholders);
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

  return (
    <section ref={sectionRef} className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div
          className={cn(
            "mb-6 sm:mb-8 md:mb-10 transition-all duration-600 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
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

        {loading ? (
          <PageLoader variant="embedded" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item, i) => (
              <div
                key={item.id ?? i}
                className={cn(
                  "transition-all duration-600 ease-out",
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={inView ? { transitionDelay: `${100 + i * 80}ms` } : undefined}
              >
                <ServicesCard
                  imageSrc={item.imageSrc}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  views={item.views}
                />
              </div>
            ))}
          </div>
        )}
      </Container12>
    </section>
  );
}
