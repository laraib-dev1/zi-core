import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import DetailWithLeftSidebar from "@/components/landing/DetailWithLeftSidebar";
import { spacing } from "@/utils/spacing";
import { getBlogById, getPublishedCatalogItems, incrementBlogView } from "@/api/blog.api";
import { getApplicationById, getApplications, incrementApplicationView } from "@/api/application.api";
import PageLoader from "@/components/ui/PageLoader";
import ApplicationDownloadDropdown from "@/components/applications/ApplicationDownloadDropdown";

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

export default function CatalogDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [item, setItem] = useState<any>(null);
  const [related, setRelated] = useState<{ title: string; href: string }[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20">
        <Navbar2 bottomDivHasColor={false} />
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
      <div className="min-h-screen flex flex-col bg-transparent pt-20">
        <Navbar2 bottomDivHasColor={false} />
        <main className="flex-1 pt-0">
          <div className={spacing.section.gap}>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Not found</h1>
              <p className="text-gray-600 mb-6">The item you are looking for does not exist or has been removed.</p>
              <Link to={backHref} className="text-[var(--theme-primary)] font-medium hover:underline">
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
    return (
      <div className="min-h-screen flex flex-col bg-transparent pt-20" style={{ overflow: "visible" }}>
        <Navbar2 bottomDivHasColor={false} />
        <main className="flex-1 pt-0">
          <div className={spacing.section.gap}>
            <div className="mx-auto max-w-6xl px-3 sm:px-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <div className="border-b border-gray-200 pb-4">
                  <h1 className="text-xl sm:text-3xl font-bold theme-heading text-left">{item.title || "Application Details"}</h1>
                  <p className="mt-1 text-sm text-gray-500">{item.subTag || "Applications / Category / Niche / Application Name"}</p>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-lg bg-gray-100 p-3 sm:p-4 sm:flex-row sm:items-center">
                  <div className="h-16 w-16 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-500">APP</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 truncate">{item.title}</h2>
                    <p className="text-xs text-gray-600 truncate">{item.shortDescription || item.subTag || "Sub info of application domain"}</p>
                  </div>
                  <ApplicationDownloadDropdown items={item.downloadsList || []} />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <div className="rounded-lg bg-gray-100 p-3 sm:p-4">
                      <h3 className="mb-2 text-lg font-semibold theme-heading">About</h3>
                      <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.description || defaultHtml }} />
                    </div>
                    {(item.featuresHtml || item.guideHtml || (item.helpEnabled && item.helpHtml)) && (
                      <div className="mt-4 space-y-3">
                        {item.featuresHtml && (
                          <div className="rounded-lg bg-gray-100 p-3 sm:p-4">
                            <h3 className="mb-2 text-lg font-semibold theme-heading">Features</h3>
                            <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.featuresHtml }} />
                          </div>
                        )}
                        {item.guideHtml && (
                          <div className="rounded-lg bg-gray-100 p-3 sm:p-4">
                            <h3 className="mb-2 text-lg font-semibold theme-heading">Guide</h3>
                            <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.guideHtml }} />
                          </div>
                        )}
                        {item.helpEnabled && item.helpHtml && (
                          <div className="rounded-lg bg-gray-100 p-3 sm:p-4">
                            <h3 className="mb-2 text-lg font-semibold theme-heading">Help</h3>
                            <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.helpHtml }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Latest Version</h3>
                    <p className="mt-1 text-sm text-gray-700">{item.latestVersionLabel || "APK"} {item.latestVersionSize ? `- ${item.latestVersionSize}` : ""}</p>
                    <div className="mt-3 space-y-2">
                      {(item.downloadsList || []).slice(0, 4).map((dl: any, idx: number) => (
                        <a
                          key={idx}
                          href={dl.fileUrl || dl.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <span>{dl.label || dl.type || "Download"}</span>
                          <span>{dl.fileSize ? `${Math.max(1, Math.round(dl.fileSize / (1024 * 1024)))}MB` : ""}</span>
                        </a>
                      ))}
                    </div>
                    {(item.media?.banner || item.media?.inner || (item.media?.screenshots || []).length > 0) && (
                      <div className="mt-4 space-y-3">
                        {item.media?.banner && <img src={item.media.banner} alt="Banner" className="w-full rounded border border-gray-200" />}
                        {item.media?.inner && <img src={item.media.inner} alt="Inner" className="w-full rounded border border-gray-200" />}
                        {(item.media?.screenshots || []).slice(0, 4).map((src: string, idx: number) => (
                          <img key={`${src}-${idx}`} src={src} alt={`Screenshot ${idx + 1}`} className="w-full rounded border border-gray-200" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
    <div className="min-h-screen flex flex-col bg-transparent pt-20" style={{ overflow: "visible" }}>
      <Navbar2 bottomDivHasColor={false} />
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
