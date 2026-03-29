import API from "./axios";
import { getApplications } from "./application.api";

function idString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object" && value !== null && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: unknown })._id ?? "").trim();
  }
  return String(value).trim();
}

// ==================== BLOG OPERATIONS ====================

export const getBlogs = async (status?: string, catalogType?: string) => {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  const type = (catalogType && String(catalogType).trim()) ? String(catalogType).trim().toLowerCase() : "blog";
  params.set("type", type);
  const url = `/blogs?${params}`;
  const res = await API.get(url);
  return res.data.data;
};

export const getBlogById = async (id: string) => {
  const res = await API.get(`/blogs/${id}`);
  return res.data.data;
};

/** Increment view count when a visitor opens the catalog item detail page */
export const incrementBlogView = async (id: string) => {
  try {
    await API.post(`/blogs/${id}/view`);
  } catch {
    /* ignore - non-critical */
  }
};

/** Fetch published catalog items for a type (e.g. "services") for public landing pages */
export const getPublishedCatalogItems = async (catalogType: string) => {
  if (String(catalogType || "").toLowerCase() === "applications") {
    return getApplications("published");
  }
  return getBlogs("published", catalogType);
};

export const createBlog = async (blog: any) => {
  const formData = new FormData();
  const catalogType = (blog.catalogType && String(blog.catalogType).trim()) ? String(blog.catalogType).trim().toLowerCase() : "blog";
  formData.append("catalogType", catalogType);
  formData.append("title", blog.title);
  formData.append("subTag", blog.subTag || "");
  formData.append("description", blog.description);
  formData.append("category", idString(blog.category));
  const nicheId = idString(blog.niche);
  if (nicheId) formData.append("niche", nicheId);
  formData.append("author", idString(blog.author));
  formData.append("status", blog.status || "draft");
  
  if (blog.tags && Array.isArray(blog.tags)) {
    blog.tags.forEach((tag: string) => formData.append("tags", tag));
  } else if (blog.tags) {
    formData.append("tags", blog.tags);
  }
  
  if (blog.imageFile) {
    formData.append("image", blog.imageFile);
  }

  const res = await API.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const updateBlog = async (id: string, blog: any) => {
  const formData = new FormData();
  const catalogType = (blog.catalogType && String(blog.catalogType).trim()) ? String(blog.catalogType).trim().toLowerCase() : "blog";
  formData.append("catalogType", catalogType);
  formData.append("title", blog.title);
  formData.append("subTag", blog.subTag || "");
  formData.append("description", blog.description);
  formData.append("category", idString(blog.category));
  const nicheUp = idString(blog.niche);
  if (nicheUp) formData.append("niche", nicheUp);
  formData.append("author", idString(blog.author));
  formData.append("status", blog.status || "draft");
  
  if (blog.tags && Array.isArray(blog.tags)) {
    blog.tags.forEach((tag: string) => formData.append("tags", tag));
  } else if (blog.tags) {
    formData.append("tags", blog.tags);
  }
  
  if (blog.imageFile) {
    formData.append("image", blog.imageFile);
  }

  const res = await API.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const deleteBlog = async (id: string) => {
  const res = await API.delete(`/blogs/${id}`);
  return res.data.success;
};

export const getBlogStats = async (catalogType?: string) => {
  const type = (catalogType && String(catalogType).trim()) ? String(catalogType).trim().toLowerCase() : "blog";
  const res = await API.get(`/blogs/stats?type=${encodeURIComponent(type)}`);
  return res.data.data;
};

// ==================== CATEGORY OPERATIONS ====================

export const getBlogCategories = async (catalogType?: string) => {
  const type = (catalogType && String(catalogType).trim()) ? String(catalogType).trim().toLowerCase() : "blog";
  const res = await API.get(`/blogs/categories/all?type=${encodeURIComponent(type)}`);
  return res.data.data;
};

export const createBlogCategory = async (category: { name: string; catalogType?: string }) => {
  const catalogType = (category.catalogType && String(category.catalogType).trim()) ? String(category.catalogType).trim().toLowerCase() : "blog";
  const res = await API.post("/blogs/categories", { name: category.name, catalogType });
  return res.data.data;
};

export const updateBlogCategory = async (id: string, category: { name: string }) => {
  const res = await API.put(`/blogs/categories/${id}`, category);
  return res.data.data;
};

export const deleteBlogCategory = async (id: string) => {
  const res = await API.delete(`/blogs/categories/${id}`);
  return res.data.success;
};

// ==================== NICHE OPERATIONS ====================

export const getBlogNiches = async (categoryId?: string, catalogType?: string) => {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", categoryId);
  const type = (catalogType && String(catalogType).trim()) ? String(catalogType).trim().toLowerCase() : "blog";
  params.set("type", type);
  const res = await API.get(`/blogs/niches/all?${params}`);
  return res.data.data;
};

export const createBlogNiche = async (niche: { name: string; category: string; catalogType?: string }) => {
  const catalogType = (niche.catalogType && String(niche.catalogType).trim()) ? String(niche.catalogType).trim().toLowerCase() : "blog";
  const res = await API.post("/blogs/niches", { name: niche.name, category: niche.category, catalogType });
  return res.data.data;
};

export const updateBlogNiche = async (id: string, niche: { name: string; category: string }) => {
  const res = await API.put(`/blogs/niches/${id}`, niche);
  return res.data.data;
};

export const deleteBlogNiche = async (id: string) => {
  const res = await API.delete(`/blogs/niches/${id}`);
  return res.data.success;
};

// ==================== AUTHOR OPERATIONS ====================

export const getBlogAuthors = async (catalogType?: string) => {
  const type = (catalogType && String(catalogType).trim()) ? String(catalogType).trim().toLowerCase() : "blog";
  const res = await API.get(`/blogs/authors/all?type=${encodeURIComponent(type)}`);
  return res.data.data;
};

export const getBlogAuthorById = async (id: string) => {
  const res = await API.get(`/blogs/authors/${id}`);
  return res.data.data;
};

export const createBlogAuthor = async (author: any) => {
  const formData = new FormData();
  const catalogType = (author.catalogType && String(author.catalogType).trim()) ? String(author.catalogType).trim().toLowerCase() : "blog";
  formData.append("catalogType", catalogType);
  formData.append("name", author.name);
  formData.append("email", author.email);
  formData.append("bio", author.bio || "");
  formData.append("facebook", author.facebook || "");
  formData.append("tiktok", author.tiktok || "");
  formData.append("instagram", author.instagram || "");
  formData.append("youtube", author.youtube || "");
  formData.append("linkedin", author.linkedin || "");
  formData.append("other", author.other || "");
  
  if (author.avatarFile) {
    formData.append("avatar", author.avatarFile);
  }

  const res = await API.post("/blogs/authors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const updateBlogAuthor = async (id: string, author: any) => {
  const formData = new FormData();
  formData.append("name", author.name);
  formData.append("email", author.email);
  formData.append("bio", author.bio || "");
  formData.append("facebook", author.facebook || "");
  formData.append("tiktok", author.tiktok || "");
  formData.append("instagram", author.instagram || "");
  formData.append("youtube", author.youtube || "");
  formData.append("linkedin", author.linkedin || "");
  formData.append("other", author.other || "");
  
  if (author.avatarFile) {
    formData.append("avatar", author.avatarFile);
  }

  const res = await API.put(`/blogs/authors/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const deleteBlogAuthor = async (id: string) => {
  const res = await API.delete(`/blogs/authors/${id}`);
  return res.data.success;
};
