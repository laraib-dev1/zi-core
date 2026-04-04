import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cnTabsTriggerPill } from "@/components/ui/tabTriggerVariants";
import BlogDashboard from "@/components/admin/blog/BlogDashboard";
import BlogsTab from "@/components/admin/blog/BlogsTab";
import BlogCategoriesTab from "@/components/admin/blog/BlogCategoriesTab";
import BlogAuthorsTab from "@/components/admin/blog/BlogAuthorsTab";
import { getEnabledCatalogTypes } from "@/api/catalogtype.api";

interface CatalogPageProps {
  forcedType?: string;
  forcedLabel?: string;
}

export default function CatalogPage({ forcedType, forcedLabel }: CatalogPageProps) {
  const { type } = useParams<{ type: string }>();
  const catalogType = forcedType || type || "blog";
  const [activeTab, setActiveTab] = useState(catalogType === "applications" ? "blogs" : "dashboard");
  const [typeLabel, setTypeLabel] = useState(
    forcedLabel || (catalogType.charAt(0).toUpperCase() + catalogType.slice(1))
  );
  const isApplications = catalogType === "applications";

  useEffect(() => {
    if (forcedLabel) {
      setTypeLabel(forcedLabel);
      return;
    }
    getEnabledCatalogTypes()
      .then((types: { slug: string; label: string }[]) => {
        const t = types.find((x) => x.slug === catalogType);
        if (t?.label) setTypeLabel(t.label);
      })
      .catch(() => {});
  }, [catalogType, forcedLabel]);

  /** Applications: single title row + Add live in BlogsTab; skip duplicate page heading and tab pill. */
  if (isApplications) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <BlogsTab catalogType={catalogType} typeLabel={typeLabel} />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold theme-heading mb-6">{typeLabel}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex gap-1 p-1.5 rounded-xl mb-6 h-auto border-0 shadow-none bg-[color-mix(in_srgb,var(--theme-primary)_10%,#e8f0f3)]">
          {!isApplications && (
            <TabsTrigger value="dashboard" className={cnTabsTriggerPill()}>
              Dashboard
            </TabsTrigger>
          )}
          <TabsTrigger value="blogs" className={cnTabsTriggerPill()}>
            {typeLabel}
          </TabsTrigger>
          {!isApplications && (
            <TabsTrigger value="categories" className={cnTabsTriggerPill()}>
              Categories & Niches
            </TabsTrigger>
          )}
          {!isApplications && (
            <TabsTrigger value="authors" className={cnTabsTriggerPill()}>
              Author Profile
            </TabsTrigger>
          )}
        </TabsList>

        {!isApplications && <TabsContent value="dashboard" className="mt-0">
          <BlogDashboard catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>}

        <TabsContent value="blogs" className="mt-0">
          <BlogsTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>

        {!isApplications && <TabsContent value="categories" className="mt-0">
          <BlogCategoriesTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>}

        {!isApplications && <TabsContent value="authors" className="mt-0">
          <BlogAuthorsTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>}
      </Tabs>
    </div>
  );
}
