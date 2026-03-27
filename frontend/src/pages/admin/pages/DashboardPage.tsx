import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SalesChart from "../../../components/admin/dashboard/SalesChart";
import { ExternalLink } from "lucide-react";
import { getCatalogTypes } from "@/api/catalogtype.api";
import { getBlogStats } from "@/api/blog.api";
import { getApplications } from "@/api/application.api";
import PageLoader from "@/components/ui/PageLoader";

interface CatalogTypeCard {
  _id: string;
  slug: string;
  label: string;
  published: number;
  total: number;
  href: string;
}

export default function DashboardPage() {
  const [catalogCards, setCatalogCards] = useState<CatalogTypeCard[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Load one card per catalog type with published count
  useEffect(() => {
    const loadCatalogCards = async () => {
      try {
        setCatalogLoading(true);
        const types = await getCatalogTypes();
        if (!types?.length) {
          setCatalogCards([]);
          return;
        }
        const cards: CatalogTypeCard[] = await Promise.all(
          types.map(async (t: { _id: string; slug: string; label: string }) => {
            const data = await getBlogStats(t.slug).catch(() => ({
              published: 0,
              totalBlogs: 0,
            }));
            return {
              _id: t._id,
              slug: t.slug,
              label: t.label,
              published: data?.published ?? 0,
              total: data?.totalBlogs ?? 0,
              href: `/admin/catalog/${t.slug}`,
            };
          })
        );
        const hasApplicationsType = cards.some((card) => card.slug === "applications");
        if (!hasApplicationsType) {
          const apps = await getApplications("all").catch(() => []);
          const list = Array.isArray(apps) ? apps : [];
          cards.push({
            _id: "applications",
            slug: "applications",
            label: "Applications",
            published: list.filter((a: any) => String(a?.status || "").toLowerCase() === "published").length,
            total: list.length,
            href: "/admin/applications",
          });
        }
        setCatalogCards(cards);
      } catch (error) {
        console.error("Failed to load catalog stats:", error);
        setCatalogCards([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalogCards();
  }, []);

  if (catalogLoading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <h1 className="text-2xl font-semibold theme-heading mb-6">Dashboard</h1>

      {/* Catalog overview – one card per catalog type (published count) */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium theme-heading">Catalog overview</h2>
        {catalogLoading ? (
          <p className="text-gray-500">Loading catalog stats...</p>
        ) : catalogCards.length === 0 ? (
          <p className="text-gray-500">No catalog types yet. Create one in Developer → Catalog Types.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {catalogCards.map((card) => (
              <Link
                key={card._id}
                to={card.href}
                className="flex rounded-lg p-4 items-center justify-between text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: "var(--theme-dark)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm opacity-80 mb-1 truncate">{card.label}</p>
                  <p className="text-2xl font-semibold">
                    {card.published} <span className="text-sm font-normal opacity-80">published</span>
                  </p>
                  {card.total > 0 && (
                    <p className="text-xs opacity-70 mt-0.5">{card.total} total</p>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 shrink-0 opacity-80 ml-2" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="w-full pt-6">
        <SalesChart catalogData={catalogCards.map((c) => ({ label: c.label, value: c.published }))} />
      </div>
    </div>
  );
}
