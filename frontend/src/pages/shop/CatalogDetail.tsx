import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ExternalLink, Loader2 } from "lucide-react";
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
import { cnTabsTriggerUnderline } from "@/components/ui/tabTriggerVariants";
import HelpBanner from "@/components/landing/HelpBanner";
import CtaBanner from "@/components/landing/CtaBanner";
import PortfolioCard from "@/components/landing/PortfolioCard";
import DetailPageLatestAndCta from "@/components/landing/DetailPageLatestAndCta";
import { cn } from "@/lib/utils";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";
import Container12 from "@/components/layout/Container12";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getApplicationPlatformNavEntries,
  getApplicationPlatformStatesLine,
  getDefaultApplicationPlatformIconPath,
} from "@/utils/applicationPlatforms";
import { resolvePublicAssetUrl } from "@/utils/mediaUrl";
import { applicationSetupFileHref } from "@/utils/applicationSetupDownloadUrl";

const navGrayBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium text-white shrink-0 border border-[#7D7D7D]/50 bg-[#7D7D7D]/70 transition-colors hover:bg-[var(--theme-primary)] hover:border-[var(--theme-primary)]";

const defaultHtml = `<p>No content available.</p>`;

function platformGuideBadgeLabel(typeKey: string, row: any): string {
  const custom = String(row?.label || "").trim();
  if (custom) return custom;
  const t = String(typeKey || "").toLowerCase();
  if (t === "website") return "Web";
  if (t === "playstore") return "Play Store";
  if (t === "apk") return "APK";
  if (t === "ios") return "iOS";
  if (t === "exe") return "Desktop";
  if (t === "windows") return "Windows";
  return "Other";
}

/** Setups tab stores guide copy in a plain textarea (`description`); render safely with line breaks. */
function setupDescriptionToSafeHtml(text: unknown): string {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return esc(raw)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.split(/\n/).join("<br/>")}</p>`)
    .join("");
}

/** Installation guide modal: one block per enabled setup row of the selected platform (Setups tab → Guide / Description), in admin order. */
function perSetupGuideModalHtmlForRows(rows: any[]): string {
  const sorted = [...rows].sort(
    (a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0)
  );
  const chunks = sorted
    .map((r) => String(r?.description ?? "").trim())
    .filter(Boolean)
    .map((t) => setupDescriptionToSafeHtml(t));
  if (chunks.length === 0) return "";
  return chunks.join('<hr class="my-4 border-gray-200" />');
}

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
  const [topBlogs, setTopBlogs] = useState<any[]>([]);
  const [activeDownloadType, setActiveDownloadType] = useState<string>("");
  const [downloadsAccordionOpen, setDownloadsAccordionOpen] = useState(false);
  const [downloadNowLoading, setDownloadNowLoading] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
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
    const ordered = ["website", "playstore", "apk", "ios", "exe", "windows", "other"];
    const byType = new Set(list.map((x: any) => String(x?.type || "other").toLowerCase()));
    const firstWithData = ordered.find((t) => byType.has(t));
    setActiveDownloadType(firstWithData || ordered[0]);
    setDownloadsAccordionOpen(false);
  }, [item, type]);

  useEffect(() => {
    if (!downloadsAccordionOpen) setDownloadNowLoading(false);
  }, [downloadsAccordionOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page">
        <Navbar2
          bottomDivHasColor={false}
          otherPagesItems={landingNav.otherPagesItems}
          companyName={landingNav.companyName}
          hireMeHref={landingNav.hireMeHref}
          companySocialLinks={landingNav.companySocialLinks}
          mainNavLinks={landingNav.mainNavLinks}
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
          mainNavLinks={landingNav.mainNavLinks}
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
    const orderedDownloadTypes: string[] = ["website", "playstore", "apk", "ios", "exe", "windows", "other"];
    const availableDownloadTypes = orderedDownloadTypes.filter((typeKey) =>
      downloadItems.some((d: any) => String(d?.type || "").toLowerCase() === typeKey)
    );
    const selectedType = String(
      activeDownloadType || availableDownloadTypes[0] || orderedDownloadTypes[0]
    );
    const filteredDownloads = downloadItems
      .filter((d: any) => String(d.type || "").toLowerCase() === selectedType)
      .sort((a: any, b: any) => (Number(a?.order) || 0) - (Number(b?.order) || 0));
    const selectedDownload = filteredDownloads[0] || null;
    const selectedDownloadHref = selectedDownload
      ? applicationSetupFileHref(String(item._id || item.id || ""), selectedType, {
          storageUrl: selectedDownload.storageUrl,
          fileUrl: selectedDownload.fileUrl,
          url: selectedDownload.url,
          setupFileGzipped: selectedDownload.setupFileGzipped,
          setupFileEncoding: selectedDownload.setupFileEncoding,
        })
      : "#";
    const resolveImg = (u: string | undefined) => resolvePublicAssetUrl(u).trim();
    const screenshotImages: string[] = Array.isArray(item.media?.screenshots)
      ? item.media.screenshots
          .filter(Boolean)
          .map((x: string) => resolveImg(x))
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const galleryImages = screenshotImages.length
      ? screenshotImages
      : item.image
        ? [resolveImg(item.image)].filter(Boolean)
        : [];
    const cleanText = (html: string) =>
      String(html || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();
    /** Main Description tab: application `description` only — not per-setup guide text (that stays in View installation guide for the selected platform). */
    const descriptionHtml = item.description || defaultHtml;
    const hasDescription = Boolean(appInfo.descriptionTabEnabled !== false && cleanText(descriptionHtml));
    const hasFeatures = Boolean(appInfo.featuresTabEnabled !== false && cleanText(item.featuresHtml));
    const hasGuide = Boolean(appInfo.guideTabEnabled !== false && cleanText(item.guideHtml));
    const hasHelp = Boolean(appInfo.supportTabEnabled !== false && item.helpEnabled && cleanText(item.helpHtml));
    const firstContentTab = hasDescription ? "description" : hasFeatures ? "features" : hasGuide ? "guide" : hasHelp ? "help" : "";
    const downloadTypeMeta: Record<string, { label: string }> = {
      website: { label: "Web" },
      playstore: { label: "Play Store" },
      apk: { label: "App" },
      ios: { label: "App" },
      windows: { label: "Windows" },
      exe: { label: "Desktop" },
      other: { label: "Other" },
    };
    const selectedTypeMeta = downloadTypeMeta[selectedType] || downloadTypeMeta.other;
    const getTypeImage = (typeKey: string): string => {
      const byType = downloadItems.find((d: any) => String(d?.type || "").toLowerCase() === typeKey);
      const imageCandidate = byType?.iconUrl || byType?.icon || byType?.imageUrl || byType?.image || "";
      const raw = String(imageCandidate || "").trim();
      return raw ? resolveImg(raw) : "";
    };
    const primaryActionIsWeb =
      selectedType === "website" ||
      selectedType === "playstore" ||
      Boolean(String(selectedDownload?.storageUrl || "").trim());
    const primaryActionLabel = primaryActionIsWeb ? "Click here" : "Download now";
    const setupGuideCombinedHtml = perSetupGuideModalHtmlForRows(filteredDownloads);
    const guideModalHtml = setupGuideCombinedHtml
      ? setupGuideCombinedHtml
      : "<p class=\"text-gray-500\">No installation guide is available for this platform yet.</p>";
    const guidePlatformBadge = platformGuideBadgeLabel(selectedType, selectedDownload);
    const subTagLine =
      (typeof item.subTag === "string" && item.subTag.trim()) ||
      (typeof appInfo.domain === "string" && appInfo.domain.trim()) ||
      "Sub info of application domain";

    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page" style={{ overflow: "visible" }}>
        <Navbar2
          bottomDivHasColor={false}
          otherPagesItems={landingNav.otherPagesItems}
          companyName={landingNav.companyName}
          hireMeHref={landingNav.hireMeHref}
          companySocialLinks={landingNav.companySocialLinks}
          mainNavLinks={landingNav.mainNavLinks}
        />
        <main className="flex-1 pt-0">
          <div>
            <Container12 className={spacing.inner.gap}>
              <section>
                <div className={`${spacing.section.gap} mb-2`}>
                  <h1 className="text-center text-2xl md:text-3xl font-bold theme-heading">Application Details</h1>
                  <p className="mt-1 text-center text-xs text-gray-500">
                    Application / {item.title || "Application Name"}
                  </p>
                </div>

                {/* 1) Top tile */}
                <section className={spacing.section.gap}>
                  <ApplicationTileCard
                    item={{
                      id: String(item._id || item.id || ""),
                      title: item.title || "Application Name",
                      subTag:
                        (typeof item.subTag === "string" && item.subTag.trim()) ||
                        (typeof appInfo.domain === "string" && appInfo.domain.trim()) ||
                        "",
                      image: resolveImg(item.image) || "",
                      releaseDate: appInfo.releaseDate || formatDate(item.createdAt) || "—",
                      downloadsText: appInfo.downloadsDisplay || "1.2k+",
                      version: appInfo.version ? `v${appInfo.version}` : "",
                      stars: Number(appInfo.stars || 0),
                      ratingCount: Number(appInfo.ratingCount || 0),
                      isTopRated: Boolean(appInfo.starsEnabled && Number(appInfo.stars || 0) >= 4),
                    }}
                    platformStatesLine={getApplicationPlatformStatesLine(downloadItems) || undefined}
                    platformLinks={getApplicationPlatformNavEntries(
                      downloadItems,
                      String(type || "applications").toLowerCase(),
                      String(item._id || item.id || "")
                    )}
                    compact={true}
                    compactVerticallyCenter
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
                          <p className="text-sm text-gray-500">
                            Built with Zi_Core Libraries.
                          </p>
                          <p className="text-sm text-gray-500">
                            Manage on GitHub and we serve good Ui, Ux, Cx, Dx, Px also continuously updating it.
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-4 flex md:justify-end">
                          <button
                            type="button"
                            onClick={() => setDownloadsAccordionOpen(true)}
                            className={navGrayBtnClass}
                          >
                            Get Latest Version
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-center gap-3 max-w-[900px] mx-auto">
                          {availableDownloadTypes.map((typeKey: string) => {
                            const meta = downloadTypeMeta[typeKey] || downloadTypeMeta.other;
                            const active = selectedType === typeKey;
                            const typeImage =
                              getTypeImage(typeKey) || getDefaultApplicationPlatformIconPath(typeKey) || "";
                            return (
                              <button
                                key={typeKey}
                                type="button"
                                onClick={() => setActiveDownloadType(typeKey)}
                                className={cn(
                                  "aspect-square w-[120px] sm:w-36 shrink-0 rounded-2xl p-2 sm:p-3 text-center transition-colors flex flex-col items-center justify-center gap-1",
                                  active ? "text-white" : "bg-gray-50 text-gray-600"
                                )}
                                style={active ? { backgroundColor: "var(--theme-primary)" } : undefined}
                              >
                                <div className="flex flex-1 min-h-0 w-full items-center justify-center">
                                  {typeImage ? (
                                    <img
                                      src={typeImage}
                                      alt={meta.label}
                                      className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 sm:h-14 sm:w-14" />
                                  )}
                                </div>
                                <div className="text-xs font-medium leading-tight">{meta.label}</div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-200" />

                        <div className="grid grid-cols-12 items-center gap-3">
                          <div className="col-span-12 md:col-span-8 min-w-0">
                            <p className="text-base font-semibold text-gray-700">
                              {selectedTypeMeta.label}
                              {filteredDownloads?.[0]?.sizeText ? ` - ${filteredDownloads[0].sizeText}` : ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              By using this, you agree to the Zi_Core terms and policies.{" "}
                              <button
                                type="button"
                                onClick={() => setInstallGuideOpen(true)}
                                className="underline underline-offset-2 hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer text-inherit"
                                style={{ color: "var(--theme-primary)" }}
                              >
                                View installation guide.
                              </button>
                            </p>
                          </div>
                          <div className="col-span-12 md:col-span-4 flex md:justify-end">
                            <a
                              href={selectedDownloadHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                navGrayBtnClass,
                                "px-6",
                                selectedDownload ? "opacity-100" : "opacity-50 pointer-events-none"
                              )}
                              onClick={() => {
                                if (!selectedDownload) return;
                                setDownloadNowLoading(true);
                                window.setTimeout(() => setDownloadNowLoading(false), 2200);
                              }}
                            >
                              {downloadNowLoading ? (
                                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                              ) : primaryActionIsWeb ? (
                                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                              ) : (
                                <Download className="h-4 w-4 shrink-0" aria-hidden />
                              )}
                              {primaryActionLabel}
                            </a>
                          </div>
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
                        <div className="w-full">
                          <TabsList className="flex gap-0.5 p-0 h-10 w-fit min-w-0 border-0 bg-transparent items-stretch mb-2">
                            {hasDescription && (
                              <TabsTrigger value="description" className={cnTabsTriggerUnderline()}>
                                Description
                              </TabsTrigger>
                            )}
                            {hasFeatures && (
                              <TabsTrigger value="features" className={cnTabsTriggerUnderline()}>
                                Features
                              </TabsTrigger>
                            )}
                            {hasGuide && (
                              <TabsTrigger value="guide" className={cnTabsTriggerUnderline()}>
                                Guide
                              </TabsTrigger>
                            )}
                            {hasHelp && (
                              <TabsTrigger value="help" className={cnTabsTriggerUnderline()}>
                                Support
                              </TabsTrigger>
                            )}
                          </TabsList>
                          <div className="h-0 w-full border-b-2 border-gray-100" aria-hidden />
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
                    <div className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio: "9 / 6" }}>
                      <img src={resolveImg(item.media.banner)} alt="Application banner" className="w-full h-full object-cover" />
                    </div>
                  </section>
                )}

                {/* 6) Inner thumbnail */}
                {appInfo.bannerEnabled !== false && item.media?.inner && (
                  <section className={spacing.section.gap}>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <img src={resolveImg(item.media.inner)} alt="Application thumbnail" className="w-full object-cover" />
                    </div>
                  </section>
                )}

                {/* 7) Inline CTA on application detail — disabled; change `false` to `true` to restore */}
                {false && (
                  <section className={`${spacing.section.gap} w-full`}>
                    <CtaBanner
                      layout="embedded"
                      variant="dark"
                      title="Like what you see?"
                      description="Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
                      buttonText="Let's Work Together"
                      buttonHref={buildWhatsAppUrl(
                        companyPhone,
                        "Hello, I visited the ZI_Core site. I would like to ask you"
                      )}
                    />
                  </section>
                )}

                {/* 8) Top 4 blogs */}
                {topBlogs.length > 0 && (
                  <section className={spacing.section.gap}>
                    <div className="flex flex-col gap-4 md:gap-5">
                      <h2 className="text-xl md:text-2xl font-semibold theme-heading m-0 shrink-0">Latest Blogs</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
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
                    </div>
                  </section>
                )}

                {/* 9) Help banner on application detail — disabled; change `false` to `true` to restore */}
                {false && (
                  <section className={spacing.section.gap}>
                    <HelpBanner
                      title="Looking for Help!"
                      description="We are updating our premium products with real-time support and dedicated consultants."
                    />
                  </section>
                )}

                <DetailPageLatestAndCta
                  catalogTypeSlug="applications"
                  currentItemId={String(item._id || item.id || id)}
                  hireMeHref={landingNav.hireMeHref}
                  wrapInContainer12={false}
                />
              </section>
            </Container12>
            <Dialog open={installGuideOpen} onOpenChange={setInstallGuideOpen}>
              <DialogContent className="max-w-[min(100vw-1.5rem,28rem)] gap-0 p-0 rounded-2xl border border-gray-200 bg-white shadow-xl">
                <DialogHeader className="border-b border-gray-200 px-6 py-4 space-y-0">
                  <DialogTitle className="text-left text-lg font-semibold text-gray-900">Guide</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-5 max-h-[min(70vh,520px)] overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-900">{item.title || "Application"}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {subTagLine} <span className="text-gray-400">|</span>{" "}
                    <span className="font-semibold" style={{ color: "var(--theme-primary)" }}>
                      {guidePlatformBadge}
                    </span>
                  </p>
                  <div
                    className="prose prose-sm max-w-none mt-4 text-gray-600"
                    dangerouslySetInnerHTML={{ __html: guideModalHtml }}
                  />
                </div>
                <DialogFooter className="border-t border-gray-100 px-6 py-4 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setInstallGuideOpen(false)}
                    className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
        mainNavLinks={landingNav.mainNavLinks}
      />
      <main className="flex-1 pt-0" style={{ overflow: "visible" }}>
        <div className={spacing.section.gap}>
          <DetailWithLeftSidebar
            sectionTitle={`${typeLabel} Detail`}
            sectionSubtitle={item.subTag || "Mini info section details"}
            heroImage={resolvePublicAssetUrl(item.image).trim() || "/hero.png"}
            title={item.title || "Untitled"}
            author={authorName || undefined}
            date={formatDate(item.createdAt)}
            views={item.views ?? 0}
            htmlContent={item.description || defaultHtml}
            relatedServices={related.length > 0 ? related : undefined}
            stickySidebar={true}
          />
        </div>
        <DetailPageLatestAndCta
          catalogTypeSlug={(item.catalogType && String(item.catalogType).toLowerCase()) || type.toLowerCase()}
          currentItemId={String(item._id || item.id || id)}
          hireMeHref={landingNav.hireMeHref}
        />
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
