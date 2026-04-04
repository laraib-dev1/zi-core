import React, { useEffect, useState } from "react";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ApplicationTileCard from "@/components/applications/ApplicationTileCard";
import CtaBanner from "@/components/landing/CtaBanner";
import { spacing } from "@/utils/spacing";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";
import { getApplications } from "@/api/application.api";
import { getPublishedCatalogItems } from "@/api/blog.api";
import { getApplicationPlatformNavEntries, getApplicationPlatformStatesLine } from "@/utils/applicationPlatforms";
import { resolvePublicAssetUrl } from "@/utils/mediaUrl";
import PageLoader from "@/components/ui/PageLoader";

interface AppRow {
  id: string;
  title: string;
  subTag: string;
  description: string;
  image: string;
  createdAt: string;
  version: string;
  stars: number;
  ratingCount: number;
  topRated: boolean;
  platformStatesLine: string;
  downloadsList: unknown;
  downloadsText: string;
}

function stripHtml(html: string, maxLength = 160): string {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function mapApplicationRows(rows: any[]): AppRow[] {
  return (Array.isArray(rows) ? rows : []).map((row: any) => {
    const rawSub =
      (typeof row.subTag === "string" && row.subTag.trim()) ||
      (typeof row.appInfo?.domain === "string" && row.appInfo.domain.trim()) ||
      "";
    return {
      id: String(row._id || row.id || ""),
      title: row.title || "Untitled Application",
      subTag: rawSub,
      description: stripHtml(row.description || "", 160),
      image: resolvePublicAssetUrl(row.image).trim() || "",
      createdAt: row.createdAt || "",
      version: row.appInfo?.version ? `v${row.appInfo.version}` : "",
      stars: Number(row.appInfo?.stars || 0),
      ratingCount: Number(row.appInfo?.ratingCount || 0),
      topRated: Boolean(row.appInfo?.starsEnabled && Number(row.appInfo?.stars || 0) >= 4),
      platformStatesLine: getApplicationPlatformStatesLine(row.downloadsList),
      downloadsList: row.downloadsList,
      downloadsText: String(row.appInfo?.downloadsDisplay || "").trim() || "1.2k+",
    };
  });
}

export default function ApplicationsListPage() {
  const landingNav = useSecondLandingNavbarProps();
  const [items, setItems] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const catalogSlug = "applications";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const [appRows, catalogRows] = await Promise.all([
          getApplications("published").catch(() => []),
          getPublishedCatalogItems("applications").catch(() => []),
        ]);
        if (cancelled) return;
        const fromApps = mapApplicationRows(Array.isArray(appRows) ? appRows : []);
        const fromCatalog = mapApplicationRows(Array.isArray(catalogRows) ? catalogRows : []);
        const byId = new Map<string, AppRow>();
        for (const row of [...fromApps, ...fromCatalog]) {
          if (row.id) byId.set(row.id, row);
        }
        setItems(Array.from(byId.values()));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <PageLoader />;
  }

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
        <Container12 className={spacing.inner.gap}>
          <div className="mb-4 sm:mb-6">
            <SectionHeader
              showBatch={false}
              showHeading
              heading="Software Application"
              cutDividerVariant="withSides"
              showMiniInfo
              miniInfo="page details sub info"
              showCutDivider={false}
              showDividerLine
              align="center"
            />
          </div>

          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No applications found.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <ApplicationTileCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    subTag: item.subTag,
                    description: item.description,
                    image: item.image,
                    releaseDate: formatDate(item.createdAt) || "—",
                    downloadsText: item.downloadsText,
                    version: item.version,
                    stars: item.stars,
                    ratingCount: item.ratingCount,
                    isTopRated: item.topRated,
                  }}
                  platformStatesLine={item.platformStatesLine || undefined}
                  platformLinks={getApplicationPlatformNavEntries(item.downloadsList, catalogSlug, item.id)}
                  viewHref={`/catalog/${catalogSlug}/${item.id}`}
                  viewLabel="View"
                />
              ))}
            </div>
          )}

          <section className={`${spacing.section.gap} w-full max-w-none`}>
            <CtaBanner
              layout="embedded"
              variant="dark"
              title="Like what you see?"
              description="Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
              buttonText="Let's Work Together"
              buttonHref={landingNav.hireMeHref}
            />
          </section>
        </Container12>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer variant="landing2" />
      </section>
    </div>
  );
}
