import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { TableOfContents } from "@/components/ui/TableOfContents";
import ShareOptions from "@/components/blog/ShareOptions";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";

export interface ExploreTopic {
  name: string;
  count: number;
}

export interface RelatedServiceItem {
  title: string;
  href: string;
}

export interface DetailWithLeftSidebarProps {
  /** Section header title (e.g. "My Projects") */
  sectionTitle: string;
  /** Section header subtitle */
  sectionSubtitle?: string;
  /** Hero image URL */
  heroImage: string;
  /** Main content title */
  title: string;
  /** Author name (e.g. "Author name") */
  author?: string;
  /** Date string (e.g. "25 Jan 2026") */
  date?: string;
  /** View count (e.g. 42) - shown next to date when > 0 */
  views?: number;
  /** Main body HTML (used for content and for Table of Contents headings) */
  htmlContent: string;
  /** Share URL (defaults to current window location when empty) */
  shareUrl?: string;
  /** Share title (defaults to content title when empty) */
  shareTitle?: string;
  /** Explore Topics list (e.g. [{ name: "Lifestyle", count: 3 }]) – used when relatedServices not provided */
  topics?: ExploreTopic[];
  /** When provided, show related items in sidebar instead of Explore Topics */
  relatedServices?: RelatedServiceItem[];
  /** Title for related items block (e.g. "Services in same category", "Courses in same category") */
  relatedSidebarTitle?: string;
  /** If true, left sidebar sticks with scroll (like BlogDetail right sidebar) */
  stickySidebar?: boolean;
  className?: string;
}

const defaultTopics: ExploreTopic[] = [
  { name: "Lifestyle", count: 3 },
  { name: "Inspiration", count: 2 },
  { name: "Fashion", count: 4 },
];

const NAV_TOP = 76;

export default function DetailWithLeftSidebar({
  sectionTitle,
  sectionSubtitle,
  heroImage,
  title,
  author = "Author name",
  date = "25 Jan 2026",
  views,
  htmlContent,
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
  shareTitle,
  topics = defaultTopics,
  relatedServices,
  relatedSidebarTitle = "Services in same category",
  stickySidebar = false,
  className,
}: DetailWithLeftSidebarProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const mainContentColumnRef = useRef<HTMLDivElement>(null);
  const effectiveShareTitle = shareTitle ?? title;

  const [sidebarFixed, setSidebarFixed] = useState<{ top: number; left: number; width: number; visible: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    visible: false,
  });

  useEffect(() => {
    if (!stickySidebar) return;
    const updateSidebarPosition = () => {
      if (!leftColumnRef.current || !mainContentColumnRef.current) return;
      const colRect = leftColumnRef.current.getBoundingClientRect();
      const contentBottom = mainContentColumnRef.current.getBoundingClientRect().bottom;
      const spacerEl = leftColumnRef.current.querySelector("[data-sidebar-spacer]") as HTMLElement | null;
      const sidebarContentHeight = spacerEl?.offsetHeight ?? leftColumnRef.current.offsetHeight;

      let top = Math.max(NAV_TOP, colRect.top);
      if (top + sidebarContentHeight > contentBottom) {
        top = Math.max(NAV_TOP, contentBottom - sidebarContentHeight);
      }
      const isLg = typeof window !== "undefined" && window.innerWidth >= 1024;
      const visible = isLg && colRect.width > 0 && contentBottom > NAV_TOP + sidebarContentHeight;

      setSidebarFixed({
        top,
        left: colRect.left,
        width: colRect.width,
        visible,
      });
    };

    const t1 = setTimeout(updateSidebarPosition, 100);
    const t2 = setTimeout(updateSidebarPosition, 400);
    window.addEventListener("scroll", updateSidebarPosition, { passive: true });
    window.addEventListener("resize", updateSidebarPosition);
    const ro = leftColumnRef.current ? new ResizeObserver(updateSidebarPosition) : null;
    if (ro && leftColumnRef.current) ro.observe(leftColumnRef.current);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", updateSidebarPosition);
      window.removeEventListener("resize", updateSidebarPosition);
      ro?.disconnect();
    };
  }, [stickySidebar]);

  const sidebarContent = (
    <>
      {htmlContent && (
        <TableOfContents
          htmlContent={htmlContent}
          contentRef={contentRef}
          variant="sidebar"
        />
      )}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Show your love!
        </h3>
        <ShareOptions
          url={shareUrl}
          title={effectiveShareTitle}
          variant="sidebar"
        />
      </div>
      {relatedServices && relatedServices.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide" style={{ color: "var(--theme-primary)" }}>
            {relatedSidebarTitle}
          </h3>
          <div className="space-y-2">
            {relatedServices.map((s, i) => (
              <Link
                key={s.href + i}
                to={s.href}
                className="block text-sm text-gray-700 hover:text-(--theme-primary) px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide" style={{ color: "var(--theme-primary)" }}>
            Explore Topics
          </h3>
          <div className="space-y-2">
            {topics.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between gap-3 text-sm text-gray-700 px-2 py-1"
              >
                <span className="leading-5">{t.name}</span>
                <span className="text-xs text-gray-500">({t.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <section className={cn("w-full bg-white", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-6 md:mb-8">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={sectionTitle}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={!!sectionSubtitle}
            miniInfo={sectionSubtitle || ""}
            showDividerLine={true}
            align="left"
          />
        </div>

        {/* Two-column container: light background + border */}
        <div className="rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50/80 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Left Sidebar – sticky (spacer + fixed clone) or in-flow */}
            {stickySidebar ? (
              <>
                <div ref={leftColumnRef} className="hidden lg:block lg:w-[min(320px,33.333%)] lg:shrink-0">
                  <div data-sidebar-spacer className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 opacity-0 pointer-events-none select-none" aria-hidden>
                    {sidebarContent}
                  </div>
                  {sidebarFixed.visible && (
                    <div
                      className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 z-20 max-h-[calc(100vh-5rem)] overflow-y-auto"
                      style={{
                        position: "fixed",
                        top: sidebarFixed.top,
                        left: sidebarFixed.left,
                        width: sidebarFixed.width,
                      }}
                    >
                      {sidebarContent}
                    </div>
                  )}
                </div>
                <aside className="lg:hidden p-4 sm:p-5 md:p-6 bg-white border-b border-gray-200 space-y-3 sm:space-y-4">
                  {sidebarContent}
                </aside>
              </>
            ) : (
              <aside className="lg:w-[min(320px,33.333%)] lg:shrink-0 p-4 sm:p-5 md:p-6 bg-white lg:border-r border-gray-200 space-y-3 sm:space-y-4">
                {sidebarContent}
              </aside>
            )}

            {/* Right Main Content – ~2/3 */}
            <div ref={mainContentColumnRef} className="flex-1 min-w-0 p-4 sm:p-5 md:p-6 lg:p-8 bg-white">
              {/* Hero Image */}
              <div
                className="w-full mb-4 sm:mb-6 rounded-lg overflow-hidden shadow-sm"
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  src={heroImage}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/product.png";
                  }}
                />
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold theme-heading text-gray-900 mb-2 sm:mb-3">
                {title}
              </h1>

              {(author || date || (views != null && views > 0)) && (
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  {author && <>By {author}</>}
                  {author && date && " . "}
                  {date && <>Date {date}</>}
                  {date && views != null && views > 0 && " . "}
                  {views != null && views > 0 && <>{views} view{views !== 1 ? "s" : ""}</>}
                </p>
              )}

              <div
                ref={contentRef}
                className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-700 content-area"
                dangerouslySetInnerHTML={{
                  __html: htmlContent || "<p>No content available.</p>",
                }}
              />
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
