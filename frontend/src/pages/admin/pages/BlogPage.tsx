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
            className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="blogs"
            className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent"
          >
            Blogs
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent"
          >
            Categories & Niches
          </TabsTrigger>
          <TabsTrigger
            value="authors"
            className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent"
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
