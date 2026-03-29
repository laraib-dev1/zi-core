import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import DetailWithLeftSidebar from "@/components/landing/DetailWithLeftSidebar";
import { spacing } from "@/utils/spacing";
import { getBlogById, getPublishedCatalogItems, incrementBlogView } from "@/api/blog.api";
import { getApplicationById, getApplications, incrementApplicationView } from "@/api/application.api";
import { getCompany } from "@/api/company.api";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";
import { buildWhatsAppUrl } from "@/utils/companyBrand";
import PageLoader from "@/components/ui/PageLoader";
import ApplicationTileCard from "@/components/applications/ApplicationTileCard";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CtaBanner from "@/components/landing/CtaBanner";
import HelpBanner from "@/components/landing/HelpBanner";
import PortfolioCard from "@/components/landing/PortfolioCard";
import { cn } from "@/lib/utils";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";

const defaultHtml = `<p>No content available.</p>`;

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const SECTION_IDS: Record<string, string> = {
  blog: "#home",
  projects: "#portfolio",
  services: "#services",
  courses: "#courses",
  applications: "#catalog-applications",
  apps: "#catalog-apps",
  websites: "#catalog-websites",
};

/** Props let `/blog/:id` reuse this page with the same layout as `/catalog/blog/:id`. */
export interface CatalogDetailProps {
  typeOverride?: string;
  idOverride?: string;
}

export default function CatalogDetail({ typeOverride, idOverride }: CatalogDetailProps = {}) {
  const landingNav = useSecondLandingNavbarProps();
  const params = useParams<{ type: string; id: string }>();
  const type = (typeOverride ?? params.type ?? "").toString();
  const id = (idOverride ?? params.id ?? "").toString();
  const [item, setItem] = useState<any>(null);
  const [related, setRelated] = useState<{ title: string; href: string }[]>([]);
  const [topApplications, setTopApplications] = useState<any[]>([]);
  const [topBlogs, setTopBlogs] = useState<any[]>([]);
  const [activeDownloadType, setActiveDownloadType] = useState<string>("");
  const [downloadsAccordionOpen, setDownloadsAccordionOpen] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(false);
  const [companyPhone, setCompanyPhone] = useState<string>(() => {
    const c = getCachedData<any>(CACHE_KEYS.COMPANY);
    return (c?.phone as string) || "";
  });

  useEffect(() => {
    if (!id || !type) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    const isApplications = type.toLowerCase() === "applications";
    const fetcher = isApplications ? getApplicationById(id) : getBlogById(id);
    fetcher
      .then((data) => {
        if (!cancelled) {
          if (isApplications) {
            setItem({ ...data, catalogType: "applications" });
            incrementApplicationView(id);
            getApplications("published")
              .then((list: any[]) => {
                if (cancelled || !Array.isArray(list)) return;
                const same = list.filter((i: any) => String(i._id || i.id) !== String(data._id || data.id));
                setTopApplications(same.slice(0, 3));
                setRelated(
                  same.slice(0, 10).map((i: any) => ({
                    title: i.title || "Untitled",
                    href: `/catalog/applications/${i._id || i.id}`,
                  }))
                );
              })
              .catch(() => {});
            getPublishedCatalogItems("blog")
              .then((list: any[]) => {
                if (cancelled || !Array.isArray(list)) return;
                setTopBlogs(list.slice(0, 4));
              })
              .catch(() => {
                if (!cancelled) setTopBlogs([]);
              });
            return;
          }
          const itemType = (data.catalogType && String(data.catalogType).toLowerCase()) || "blog";
          if (itemType !== type.toLowerCase()) {
            setNotFound(true);
            return;
          }
          setItem(data);
          incrementBlogView(id);
          const categoryId = data.category && (typeof data.category === "object" ? data.category._id : data.category);
          if (categoryId) {
            getPublishedCatalogItems(itemType)
              .then((list: any[]) => {
                if (cancelled || !Array.isArray(list)) return;
                const currentId = data._id || data.id;
                const same = list.filter((i: any) => {
                  const iId = i._id || i.id;
                  if (iId === currentId) return false;
                  const iCat = i.category && (typeof i.category === "object" ? i.category._id : i.category);
                  return iCat === categoryId;
                });
                setRelated(
                  same.slice(0, 10).map((i: any) => ({
                    title: i.title || "Untitled",
                    href: `/catalog/${type}/${i._id || i.id}`,
                  }))
                );
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, type]);

  useEffect(() => {
    const loadCompanyPhone = async () => {
      try {
        const c = await getCompany();
        if (c?.phone) setCompanyPhone(String(c.phone));
      } catch {
        /* keep cache */
      }
    };
    loadCompanyPhone();
  }, []);

  useEffect(() => {
    const isApplications = String(type || "").toLowerCase() === "applications";
    if (!isApplications || !item) return;
    const list = (Array.isArray(item.downloadsList) ? item.downloadsList : []).filter((x: any) => x?.enabled !== false);
    const ordered = ["website", "apk", "exe", "windows", "other"];
    const byType = new Set(list.map((x: any) => String(x?.type || "other").toLowerCase()));
    const firstWithData = ordered.find((t) => byType.has(t));
    setActiveDownloadType(firstWithData || ordered[0]);
    setDownloadsAccordionOpen(false);
  }, [item, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page">
        <Navbar2
          bottomDivHasColor={false}
          otherPagesItems={landingNav.otherPagesItems}
          companyName={landingNav.companyName}
          hireMeHref={landingNav.hireMeHref}
          companySocialLinks={landingNav.companySocialLinks}
        />
        <main className="flex-1 flex items-center justify-center">
          <PageLoader />
        </main>
      </div>
    );
  }

  if (notFound || !item) {
    const normalizedType = String(type || "").toLowerCase();
    const backHref = SECTION_IDS[normalizedType] || `/#catalog-${normalizedType}`;
    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page">
        <Navbar2
          bottomDivHasColor={false}
          otherPagesItems={landingNav.otherPagesItems}
          companyName={landingNav.companyName}
          hireMeHref={landingNav.hireMeHref}
          companySocialLinks={landingNav.companySocialLinks}
        />
        <main className="flex-1 pt-0">
          <div className={spacing.section.gap}>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Not found</h1>
              <p className="text-gray-600 mb-6">The item you are looking for does not exist or has been removed.</p>
              <Link to={backHref} className="text-(--theme-primary) font-medium hover:underline">
                ← Back
              </Link>
            </div>
          </div>
        </main>
        <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Footer variant="landing2" />
        </section>
      </div>
    );
  }

  const authorName = item.author && (typeof item.author === "object" ? item.author.name : null);
  const typeLabel = (type && type[0].toUpperCase() + type.slice(1)) || "Item";
  const isApplications = String(type || "").toLowerCase() === "applications";

  if (isApplications) {
    const appInfo = item.appInfo || {};
    const allDownloadItems = Array.isArray(item.downloadsList) ? item.downloadsList : [];
    const downloadItems = allDownloadItems.filter((d: any) => d?.enabled !== false);
    const filteredDownloads = activeDownloadType
      ? downloadItems.filter((d: any) => String(d.type || "").toLowerCase() === activeDownloadType)
      : downloadItems;
    const screenshotImages: string[] = Array.isArray(item.media?.screenshots)
      ? item.media.screenshots.filter(Boolean).slice(0, 5)
      : [];
    const galleryImages = screenshotImages.length ? screenshotImages : item.image ? [item.image] : [];
    const cleanText = (html: string) => String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const setupDescriptionBlocks = downloadItems
      .filter((d: any) => String(d?.description || "").trim())
      .map((d: any) => `<h4>${String(d?.label || d?.type || "").toUpperCase()}</h4><p>${String(d.description || "")}</p>`)
      .join("");
    const descriptionHtml = `${setupDescriptionBlocks}${item.description || defaultHtml}`;
    const hasDescription = Boolean(appInfo.descriptionTabEnabled !== false && cleanText(descriptionHtml));
    const hasFeatures = Boolean(appInfo.featuresTabEnabled !== false && cleanText(item.featuresHtml));
    const hasGuide = Boolean(appInfo.guideTabEnabled !== false && cleanText(item.guideHtml));
    const hasHelp = Boolean(appInfo.supportTabEnabled !== false && item.helpEnabled && cleanText(item.helpHtml));
    const firstContentTab = hasDescription ? "description" : hasFeatures ? "features" : hasGuide ? "guide" : hasHelp ? "help" : "";
    const downloadTypeMeta: Record<string, { label: string }> = {
      website: { label: "Web" },
      apk: { label: "APK" },
      windows: { label: "Windows" },
      exe: { label: ".exe" },
      other: { label: "Other" },
    };
    const orderedDownloadTypes: string[] = ["website", "apk", "exe", "windows", "other"];
    const selectedType = String(activeDownloadType || orderedDownloadTypes[0]);
    const selectedTypeMeta = downloadTypeMeta[selectedType] || downloadTypeMeta.other;
    const getTypeImage = (typeKey: string): string => {
      const byType = downloadItems.find((d: any) => String(d?.type || "").toLowerCase() === typeKey);
      const imageCandidate = byType?.iconUrl || byType?.icon || byType?.imageUrl || byType?.image || "";
      return String(imageCandidate || "");
    };

    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page" style={{ overflow: "visible" }}>
        <Navbar2
          bottomDivHasColor={false}
          otherPagesItems={landingNav.otherPagesItems}
          companyName={landingNav.companyName}
          hireMeHref={landingNav.hireMeHref}
          companySocialLinks={landingNav.companySocialLinks}
        />
        <main className="flex-1 pt-0">
          <div>
            <div className={`mx-auto max-w-[1232px] ${spacing.container.paddingSmall}`}>
              <section>
                <div className={`${spacing.section.gap} mb-2`}>
                  <h1 className="text-center text-2xl md:text-3xl font-bold theme-heading">Application Details</h1>
                  <p className="mt-1 text-center text-xs text-gray-500">
                    Applications / Category / Niche / {item.title || "Application Name"}
                  </p>
                </div>

                {/* 1) Top tile */}
                <section className={spacing.section.gap}>
                  <ApplicationTileCard
                    item={{
                      id: String(item._id || item.id || ""),
                      title: item.title || "Application Name",
                      subTag: item.subTag || appInfo.domain || "Sub info of application domain",
                      image: item.image || "",
                      releaseDate: appInfo.releaseDate || formatDate(item.createdAt) || "—",
                      downloadsText: appInfo.downloadsDisplay || "1.2k+",
                      version: appInfo.version ? `v${appInfo.version}` : "",
                      stars: Number(appInfo.stars || 0),
                      ratingCount: Number(appInfo.ratingCount || 0),
                      isTopRated: Boolean(appInfo.starsEnabled && Number(appInfo.stars || 0) >= 4),
                    }}
                    compact={true}
                    hideActionButton
                    className="bg-transparent"
                  />
                </section>

                {/* 2) Download category switcher + list */}
                {downloadItems.length > 0 && (
                  <section id="app-download-section" className={`${spacing.section.gap}`}>
                    {!downloadsAccordionOpen ? (
                      <div className="grid grid-cols-12 items-center gap-3">
                        <div className="col-span-12 md:col-span-8 min-w-0">
                          <p className="text-sm text-gray-500 truncate">
                            By using this, you agree to the terms and policies. View installation guide.
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-4 flex md:justify-end">
                          <button
                            type="button"
                            onClick={() => setDownloadsAccordionOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium text-white shrink-0"
                            style={{ backgroundColor: "var(--theme-primary)" }}
                          >
                            Get Latest Version
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[900px] mx-auto">
                          {orderedDownloadTypes.map((typeKey: string) => {
                            const meta = downloadTypeMeta[typeKey] || downloadTypeMeta.other;
                            const active = selectedType === typeKey;
                            const typeImage = getTypeImage(typeKey);
                            return (
                              <button
                                key={typeKey}
                                type="button"
                                onClick={() => setActiveDownloadType(typeKey)}
                                className={cn(
                                  "rounded-2xl p-2 text-center transition-colors min-h-[74px] flex flex-col items-center justify-center",
                                  active ? "text-white" : "bg-gray-50 text-gray-600"
                                )}
                                style={active ? { backgroundColor: "var(--theme-primary)" } : undefined}
                              >
                                <div className="flex justify-center items-center">
                                  {typeImage ? (
                                    <img
                                      src={typeImage}
                                      alt={meta.label}
                                      className="h-5 w-5 object-contain"
                                    />
                                  ) : (
                                    <div className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="mt-1 text-xs font-medium">{meta.label}</div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-200" />

                        <div className="grid grid-cols-12 items-center gap-3">
                          <div className="col-span-12 md:col-span-8 min-w-0" />
                          <div className="col-span-12 md:col-span-4 flex md:justify-end">
                            <button
                              type="button"
                              onClick={() => setDownloadsAccordionOpen(false)}
                              className="inline-flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium text-white shrink-0"
                              style={{ backgroundColor: "var(--theme-primary)" }}
                            >
                              Download Now
                              <ChevronUp className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          {filteredDownloads.length === 0 ? (
                            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                              No record
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredDownloads.map((dl: any, idx: number) => (
                                <a
                                  key={`${dl.fileUrl || dl.url || "download"}-${idx}`}
                                  href={dl.fileUrl || dl.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 hover:bg-gray-100"
                                >
                                  <span className="text-sm font-medium text-gray-800">{dl.label || selectedTypeMeta.label}</span>
                                  <span className="text-xs text-gray-500">
                                    {dl.sizeText || (dl.fileSize ? `${Math.max(1, Math.round(Number(dl.fileSize) / (1024 * 1024)))} MB` : "")}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* 3 + 4) gallery + tabbed content */}
                <section className={spacing.section.gap}>
                  <div className="grid grid-cols-12 gap-4">
                    {appInfo.imagesEnabled !== false && (
                      <div className="col-span-12 lg:col-span-4">
                        <div className="rounded-xl bg-transparent overflow-hidden h-full min-h-[280px]">
                          <ProductImageGallery images={galleryImages} transparentBackground />
                        </div>
                      </div>
                    )}
                    <div className="col-span-12 lg:col-span-8">
                      <h3 className="text-3xl font-semibold theme-text-primary">About</h3>
                      <h4 className="mt-1 text-2xl font-bold text-gray-800">{item.title || "Application"}</h4>
                      {(appInfo.downloadsEnabled && appInfo.downloadsDisplay) || appInfo.datesEnabled ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {appInfo.downloadsEnabled && appInfo.downloadsDisplay ? (
                            <span>Downloads: {appInfo.downloadsDisplay}</span>
                          ) : null}
                          {appInfo.datesEnabled ? (
                            <>
                              {appInfo.downloadsEnabled && appInfo.downloadsDisplay ? " " : null}
                              <span>Released: {appInfo.releaseDate || formatDate(item.createdAt) || "—"}</span>
                              {" "}
                              <span>Update: {appInfo.updateDate || "—"}</span>
                            </>
                          ) : null}
                        </p>
                      ) : null}
                      <p className="mt-2 text-base text-slate-400 leading-7 whitespace-pre-line">
                        {appInfo.intro || item.shortDescription || cleanText(item.description || "").slice(0, 420) || "Mini Description"}
                      </p>
                    </div>
                    <div className="col-span-12">
                      <Tabs defaultValue={firstContentTab || "description"}>
                        <div className="w-full border-b-2 border-gray-100">
                          <TabsList className="flex gap-0 p-0 h-auto w-fit min-w-0 border-0 bg-transparent">
                            {hasDescription && (
                              <TabsTrigger
                                value="description"
                                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 data-[state=active]:bg-(--theme-primary) data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:scale-100 mb-1 transition-colors border-0 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#e5e7eb)] data-[state=active]:hover:bg-(--theme-primary)"
                              >
                                Description
                              </TabsTrigger>
                            )}
                            {hasFeatures && (
                              <TabsTrigger
                                value="features"
                                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 data-[state=active]:bg-(--theme-primary) data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:scale-100 mb-1 transition-colors border-0 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#e5e7eb)] data-[state=active]:hover:bg-(--theme-primary)"
                              >
                                Features
                              </TabsTrigger>
                            )}
                            {hasGuide && (
                              <TabsTrigger
                                value="guide"
                                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 data-[state=active]:bg-(--theme-primary) data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:scale-100 mb-1 transition-colors border-0 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#e5e7eb)] data-[state=active]:hover:bg-(--theme-primary)"
                              >
                                Guide
                              </TabsTrigger>
                            )}
                            {hasHelp && (
                              <TabsTrigger
                                value="help"
                                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 data-[state=active]:bg-(--theme-primary) data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:scale-100 mb-1 transition-colors border-0 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#e5e7eb)] data-[state=active]:hover:bg-(--theme-primary)"
                              >
                                Support
                              </TabsTrigger>
                            )}
                          </TabsList>
                        </div>
                        {hasDescription && (
                          <TabsContent value="description" className="mt-4">
                            <div
                              className="rounded-xl p-4 sm:p-6"
                              style={{
                                backgroundColor: "#FDFBF8",
                                border: "1px solid #E5E5E5",
                              }}
                            >
                              <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                            </div>
                          </TabsContent>
                        )}
                        {hasFeatures && (
                          <TabsContent value="features" className="mt-4">
                            <div
                              className="rounded-xl p-4 sm:p-6"
                              style={{
                                backgroundColor: "#FDFBF8",
                                border: "1px solid #E5E5E5",
                              }}
                            >
                              <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.featuresHtml }} />
                            </div>
                          </TabsContent>
                        )}
                        {hasGuide && (
                          <TabsContent value="guide" className="mt-4">
                            <div
                              className="rounded-xl p-4 sm:p-6"
                              style={{
                                backgroundColor: "#FDFBF8",
                                border: "1px solid #E5E5E5",
                              }}
                            >
                              <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.guideHtml }} />
                            </div>
                          </TabsContent>
                        )}
                        {hasHelp && (
                          <TabsContent value="help" className="mt-4">
                            <div
                              className="rounded-xl p-4 sm:p-6"
                              style={{
                                backgroundColor: "#FDFBF8",
                                border: "1px solid #E5E5E5",
                              }}
                            >
                              <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.helpHtml }} />
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </div>
                </section>

                {/* 5) Banner 9:6 */}
                {appInfo.thumbnailEnabled !== false && item.media?.banner && (
                  <section className={spacing.section.gap}>
                    <div className="w-full" style={{ aspectRatio: "9 / 6" }}>
                      <img src={item.media.banner} alt="Application banner" className="w-full h-full object-cover" />
                    </div>
                  </section>
                )}

                {/* 6) Top 3 applications */}
                {topApplications.length > 0 && (
                  <section className={spacing.section.gap}>
                    <h2 className="text-xl md:text-2xl font-semibold theme-heading mb-3">Top Applications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {topApplications.map((app: any, i: number) => (
                        <Link
                          key={app._id || app.id || i}
                          to={`/catalog/applications/${app._id || app.id}`}
                          className={`rounded-lg bg-white ${spacing.container.paddingSmall} py-3 hover:shadow-sm transition-shadow`}
                        >
                          <div className="h-32 rounded-md bg-gray-100 overflow-hidden">
                            <img src={app.image || "/hero.png"} alt={app.title || "Application"} className="w-full h-full object-cover" />
                          </div>
                          <div className="mt-2 font-medium text-sm text-gray-900 line-clamp-1">{app.title || "Untitled"}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{app.subTag || "Sub info of application domain"}</div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* 7) Inner thumbnail */}
                {appInfo.bannerEnabled !== false && item.media?.inner && (
                  <section className={spacing.section.gap}>
                    <img src={item.media.inner} alt="Application thumbnail" className="w-full object-cover" />
                  </section>
                )}

                {/* 8) CTA from second landing */}
                <section className={spacing.section.gap}>
                  <CtaBanner
                    variant="dark"
                    title="Like what you see?"
                    description="Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
                    buttonText="Let's Work Together"
                    buttonHref={buildWhatsAppUrl(companyPhone, "Hi! I'd like to work together.")}
                  />
                </section>

                {/* 9) Top 4 blogs */}
                {topBlogs.length > 0 && (
                  <section className={spacing.section.gap}>
                    <h2 className="text-xl md:text-2xl font-semibold theme-heading mb-3">Latest Blogs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {topBlogs.map((blog: any, i: number) => (
                        <PortfolioCard
                          key={blog._id || blog.id || i}
                          id={String(blog._id || blog.id || i)}
                          title={blog.title || "Untitled"}
                          description={cleanText(blog.description || "No description")}
                          image={blog.image || "/hero.png"}
                          date={formatDate(blog.createdAt) || "—"}
                          niche={blog.category?.name || "Blog"}
                          views={Number(blog.views || 0)}
                          index={i}
                          inView={true}
                          to={`/catalog/blog/${blog._id || blog.id}`}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 10) Help banner from second landing */}
                <section className={spacing.section.gap}>
                  <HelpBanner
                    title="Looking for Help!"
                    description="We are updating our premium products with real-time support and dedicated consultants."
                  />
                </section>
              </section>
            </div>
          </div>
        </main>
        <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Footer variant="landing2" />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page" style={{ overflow: "visible" }}>
      <Navbar2
        bottomDivHasColor={false}
        otherPagesItems={landingNav.otherPagesItems}
        companyName={landingNav.companyName}
        hireMeHref={landingNav.hireMeHref}
        companySocialLinks={landingNav.companySocialLinks}
      />
      <main className="flex-1 pt-0" style={{ overflow: "visible" }}>
        <div className={spacing.section.gap}>
          <DetailWithLeftSidebar
            sectionTitle={`${typeLabel} Detail`}
            sectionSubtitle={item.subTag || "Mini info section details"}
            heroImage={item.image || "/hero.png"}
            title={item.title || "Untitled"}
            author={authorName || undefined}
            date={formatDate(item.createdAt)}
            views={item.views ?? 0}
            htmlContent={item.description || defaultHtml}
            relatedServices={related.length > 0 ? related : undefined}
            relatedSidebarTitle={`${typeLabel}s in same category`}
            stickySidebar={true}
          />
        </div>
      </main>
      <section
        className={`w-full ${spacing.footer.gapTop}`}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <Footer variant="landing2" />
      </section>
    </div>
  );
}
