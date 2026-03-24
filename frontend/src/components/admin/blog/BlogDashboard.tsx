import React, { useEffect, useState } from "react";
import { getBlogStats } from "@/api/blog.api";
import { FileText, CheckCircle, XCircle, Edit, Eye, Share2, MessageSquare, Link as LinkIcon } from "lucide-react";

interface BlogStats {
  totalBlogs: number;
  published: number;
  unpublished: number;
  draft: number;
  views: number;
  shares: number;
  comments: number;
  links: number;
}

interface BlogDashboardProps {
  catalogType?: string;
  typeLabel?: string;
}

export default function BlogDashboard({ catalogType = "blog", typeLabel = "Blog" }: BlogDashboardProps) {
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    published: 0,
    unpublished: 0,
    draft: 0,
    views: 0,
    shares: 0,
    comments: 0,
    links: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [catalogType]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getBlogStats(catalogType);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch blog stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: `Total ${typeLabel}`, value: stats.totalBlogs, icon: FileText },
    { label: "Published", value: stats.published, icon: CheckCircle },
    { label: "Unpublished", value: stats.unpublished, icon: XCircle },
    { label: "Draft", value: stats.draft, icon: Edit },
    { label: "Views", value: stats.views.toLocaleString(), icon: Eye },
    { label: "Share", value: stats.shares, icon: Share2 },
    { label: "Comments", value: stats.comments, icon: MessageSquare },
    { label: "Links", value: `${stats.links}/50`, icon: LinkIcon },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading stats...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold theme-heading mb-6">{typeLabel} Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6 theme-text-primary" />
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              </div>
              <p className="text-sm text-gray-600">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
