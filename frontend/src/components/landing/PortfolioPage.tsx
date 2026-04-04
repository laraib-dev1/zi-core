// Portfolio page: same UI as Shop (navbar + banner + category dropdown + main + footer), 12-col layout
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";
import Footer from "@/components/layout/Footer";
import Container12 from "@/components/layout/Container12";
import PortfolioCard from "@/components/landing/PortfolioCard";
import Banner from "@/components/hero/Banner";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getBanners, type Banner as BannerType } from "@/api/banner.api";
import { spacing } from "@/utils/spacing";
import PageLoader from "@/components/ui/PageLoader";
import { ChevronDown, Check } from "lucide-react";

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

function getCategoryName(item: any): string {
  if (item.category && typeof item.category === "object" && item.category.name) {
    return item.category.name;
  }
  if (typeof item.category === "string") return item.category;
  return "Project";
}

export default function PortfolioPage() {
  const landingNav = useSecondLandingNavbarProps();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioBanner, setPortfolioBanner] = useState<BannerType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    let cancelled = false;
    getPublishedCatalogItems("projects")
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error("Error fetching projects:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    getBanners()
      .then((data) => {
        const banner = data.find((b) => b.slot === "shop-main");
        setPortfolioBanner(banner || null);
      })
      .catch(() => setPortfolioBanner(null));
  }, []);

  // Unique categories from projects
  const categoryNames = [...new Set(items.map(getCategoryName))].filter(Boolean).sort();
  const filteredItems = selectedCategory
    ? items.filter((i) => getCategoryName(i) === selectedCategory)
    : items;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col w-full">
      <Navbar2
        bottomDivHasColor={false}
        otherPagesItems={landingNav.otherPagesItems}
        companyName={landingNav.companyName}
        hireMeHref={landingNav.hireMeHref}
        companySocialLinks={landingNav.companySocialLinks}
        mainNavLinks={landingNav.mainNavLinks}
      />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1 w-full`}>
        <Container12 grid gap="gap-6" className={spacing.section.gap}>
          {/* Banner: full 12 cols */}
          <div className="col-span-12">
            <Banner imageSrc={portfolioBanner?.imageUrl || "/hero.png"} alt="Portfolio Banner" />
          </div>

          {/* Header + dropdown: full 12 cols */}
          <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold theme-heading m-0 p-0">Portfolio</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[180px]" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 flex items-center justify-between text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {selectedCategory ? selectedCategory : `All (${items.length})`}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/portfoliopage");
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors text-left ${
                        !selectedCategory ? "bg-[var(--theme-primary)] text-white" : "text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="flex-1">All</span>
                        <span className={`text-xs whitespace-nowrap w-14 text-right ${!selectedCategory ? "text-white" : "text-gray-500"}`}>
                          ({items.length})
                        </span>
                      </div>
                      {!selectedCategory && <Check className="w-4 h-4 ml-2 shrink-0" />}
                    </button>
                    {categoryNames.map((name) => {
                      const count = items.filter((i) => getCategoryName(i) === name).length;
                      const isSelected = selectedCategory === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            navigate(`/portfoliopage?category=${encodeURIComponent(name)}`);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors text-left ${
                            isSelected ? "bg-[var(--theme-primary)] text-white" : "text-gray-900"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <span className="flex-1">{name}</span>
                            <span className={`text-xs whitespace-nowrap w-14 text-right ${isSelected ? "text-white" : "text-gray-500"}`}>
                              ({count})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 ml-2 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project grid: 12 cols — col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 */}
          {filteredItems.map((item, i) => (
            <div key={item._id || item.id || i} className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
              <PortfolioCard
                id={item._id || item.id || `item-${i}`}
                title={item.title || "Untitled Project"}
                description={stripHtml(item.description || "No description", 120)}
                image={item.image || "/hero.png"}
                date={formatDate(item.createdAt) || "—"}
                niche={getCategoryName(item)}
                index={i}
                inView={true}
              />
            </div>
          ))}
        </Container12>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer variant="landing2" />
      </section>
    </div>
  );
}
