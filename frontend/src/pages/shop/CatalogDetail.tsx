import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import DetailWithLeftSidebar from "@/components/landing/DetailWithLeftSidebar";
import { spacing } from "@/utils/spacing";
import { getBlogById, getPublishedCatalogItems, incrementBlogView } from "@/api/blog.api";
import PageLoader from "@/components/ui/PageLoader";

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
    getBlogById(id)
      .then((data) => {
        if (!cancelled) {
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
    const backHref = SECTION_IDS[type || ""] || "/";
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
