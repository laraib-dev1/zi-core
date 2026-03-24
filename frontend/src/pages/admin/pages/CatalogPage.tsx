import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlogDashboard from "@/components/admin/blog/BlogDashboard";
import BlogsTab from "@/components/admin/blog/BlogsTab";
import BlogCategoriesTab from "@/components/admin/blog/BlogCategoriesTab";
import BlogAuthorsTab from "@/components/admin/blog/BlogAuthorsTab";
import { getEnabledCatalogTypes } from "@/api/catalogtype.api";

export default function CatalogPage() {
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState("dashboard");
  const catalogType = type || "blog";
  const [typeLabel, setTypeLabel] = useState(catalogType.charAt(0).toUpperCase() + catalogType.slice(1));

  useEffect(() => {
    getEnabledCatalogTypes()
      .then((types: { slug: string; label: string }[]) => {
        const t = types.find((x) => x.slug === catalogType);
        if (t?.label) setTypeLabel(t.label);
      })
      .catch(() => {});
  }, [catalogType]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold theme-heading mb-6">{typeLabel}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex gap-1 p-1.5 rounded-xl mb-6 h-auto border-0 shadow-none bg-[color-mix(in_srgb,var(--theme-primary)_10%,#e8f0f3)]">
          <TabsTrigger
            value="dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] transition-colors"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="blogs"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] transition-colors"
          >
            {typeLabel}
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] transition-colors"
          >
            Categories & Niches
          </TabsTrigger>
          <TabsTrigger
            value="authors"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] transition-colors"
          >
            Author Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <BlogDashboard catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>

        <TabsContent value="blogs" className="mt-0">
          <BlogsTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <BlogCategoriesTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>

        <TabsContent value="authors" className="mt-0">
          <BlogAuthorsTab catalogType={catalogType} typeLabel={typeLabel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
