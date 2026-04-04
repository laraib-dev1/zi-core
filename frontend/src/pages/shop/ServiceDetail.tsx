import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";
import Footer from "@/components/layout/Footer";
import DetailWithLeftSidebar from "@/components/landing/DetailWithLeftSidebar";
import DetailPageLatestAndCta from "@/components/landing/DetailPageLatestAndCta";
import { spacing } from "@/utils/spacing";
import { getBlogById, getPublishedCatalogItems, incrementBlogView } from "@/api/blog.api";
import PageLoader from "@/components/ui/PageLoader";

const defaultServiceHtml = `<p>No content available.</p>`;

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ServiceDetail() {
  const landingNav = useSecondLandingNavbarProps();
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<{ title: string; href: string }[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
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
          const type = (data.catalogType && String(data.catalogType).toLowerCase()) || "blog";
          if (type !== "services") {
            setNotFound(true);
            return;
          }
          setService(data);
          if (id) incrementBlogView(id);
          const categoryId = data.category && (typeof data.category === "object" ? data.category._id : data.category);
          if (categoryId) {
            getPublishedCatalogItems("services")
              .then((list: any[]) => {
                if (cancelled || !Array.isArray(list)) return;
                const currentId = data._id || data.id;
                const sameCategory = list.filter((item: any) => {
                  const itemId = item._id || item.id;
                  if (itemId === currentId) return false;
                  const itemCat = item.category && (typeof item.category === "object" ? item.category._id : item.category);
                  return itemCat === categoryId;
                });
                setRelatedServices(
                  sameCategory.slice(0, 10).map((item: any) => ({
                    title: item.title || "Untitled",
                    href: `/service/${item._id || item.id}`,
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
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  if (notFound || !service) {
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h1>
              <p className="text-gray-600 mb-6">The service you are looking for does not exist or has been removed.</p>
              <Link to="/#services" className="text-[var(--theme-primary)] font-medium hover:underline">
                ← Back to Services
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

  const authorName =
    service.author && (typeof service.author === "object" ? service.author.name : null);

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
            sectionTitle="Service Detail"
            sectionSubtitle={service.subTag || "Mini info section details"}
            heroImage={service.image || "/hero.png"}
            title={service.title || "Untitled Service"}
            author={authorName || undefined}
            date={formatDate(service.createdAt)}
            views={service.views ?? 0}
            htmlContent={service.description || defaultServiceHtml}
            relatedServices={relatedServices.length > 0 ? relatedServices : undefined}
            stickySidebar={true}
            bookMeetingHref={landingNav.hireMeHref}
            bookMeetingLabel="Set Meeting"
          />
        </div>
        <DetailPageLatestAndCta
          catalogTypeSlug="services"
          currentItemId={String(service._id || service.id || id)}
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
