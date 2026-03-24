import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Blog {
  id?: string;
  _id?: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  category: string | { _id: string; name: string };
  categoryName?: string;
  niche?: string | { _id: string; name: string };
  nicheName?: string;
  author: string | { _id: string; name: string; email: string; avatar?: string };
  authorName?: string;
  tags?: string[];
  status: "published" | "unpublished" | "draft";
  views: number;
  comments: number;
  shares?: number;
  links?: number;
  createdAt?: string;
}

interface BlogGridProps {
  blogs: Blog[];
  onView: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogGrid({ blogs, onView, onEdit, onDelete }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {blogs.map((blog) => (
        <div
          key={blog.id || blog._id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Image - use default when missing or on error */}
          <div className="relative w-full bg-gray-200 aspect-[16/9]">
            <img
              src={blog.image && blog.image.trim() ? blog.image : "/hero.png"}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/hero.png";
              }}
            />
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  blog.status === "published"
                    ? "bg-green-100 text-green-800"
                    : blog.status === "unpublished"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {blog.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
            {blog.categoryName && (
              <p className="text-xs text-gray-500 mb-2">{blog.categoryName}</p>
            )}
            {blog.createdAt && (
              <p className="text-xs text-gray-400 mb-3">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
              <span>{blog.views || 0} views</span>
              <span>{blog.comments || 0} comments</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(blog)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(blog)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(blog)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
