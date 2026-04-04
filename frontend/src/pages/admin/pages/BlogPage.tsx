import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlogDashboard from "@/components/admin/blog/BlogDashboard";
import BlogsTab from "@/components/admin/blog/BlogsTab";
import BlogCategoriesTab from "@/components/admin/blog/BlogCategoriesTab";
import BlogAuthorsTab from "@/components/admin/blog/BlogAuthorsTab";

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold theme-heading mb-6">Blogging</h1>
      
      {/* Tabs with line separator */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-gray-300 rounded-none p-0 h-auto mb-6">
          <TabsTrigger
            value="dashboard"
            className="min-h-10 box-border px-4 py-2 text-sm font-medium leading-normal rounded-t-md border-b-2 border-transparent transition-colors hover:bg-[color-mix(in_srgb,var(--theme-primary)_10%,#f9fafb)] data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--theme-primary)] data-[state=inactive]:text-gray-600"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="blogs"
            className="min-h-10 box-border px-4 py-2 text-sm font-medium leading-normal rounded-t-md border-b-2 border-transparent transition-colors hover:bg-[color-mix(in_srgb,var(--theme-primary)_10%,#f9fafb)] data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--theme-primary)] data-[state=inactive]:text-gray-600"
          >
            Blogs
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="min-h-10 box-border px-4 py-2 text-sm font-medium leading-normal rounded-t-md border-b-2 border-transparent transition-colors hover:bg-[color-mix(in_srgb,var(--theme-primary)_10%,#f9fafb)] data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--theme-primary)] data-[state=inactive]:text-gray-600"
          >
            Categories & Niches
          </TabsTrigger>
          <TabsTrigger
            value="authors"
            className="min-h-10 box-border px-4 py-2 text-sm font-medium leading-normal rounded-t-md border-b-2 border-transparent transition-colors hover:bg-[color-mix(in_srgb,var(--theme-primary)_10%,#f9fafb)] data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--theme-primary)] data-[state=inactive]:text-gray-600"
          >
            Author Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <BlogDashboard />
        </TabsContent>

        <TabsContent value="blogs" className="mt-0">
          <BlogsTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <BlogCategoriesTab />
        </TabsContent>

        <TabsContent value="authors" className="mt-0">
          <BlogAuthorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
