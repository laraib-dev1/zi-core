// backend/src/controllers/blog.controller.js
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import BlogCategory from "../models/BlogCategory.js";
import BlogNiche from "../models/BlogNiche.js";
import BlogAuthor from "../models/BlogAuthor.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import connectDB from "../config/db.js";

// Normalize catalog type from request: always return lowercase, never empty (default "blog")
function normalizeCatalogType(value) {
  const t = (value && String(value).trim().toLowerCase()) || "";
  return t || "blog";
}

/** Normalize Mongo id from string or populated object; invalid → null */
function toObjectIdString(value) {
  if (value == null || value === "") return null;
  if (typeof value === "object" && value._id) {
    value = value._id;
  }
  const s = String(value).trim();
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return s;
}

// Build query for a catalog type: only that type; for "blog" include legacy (missing/empty)
function catalogQuery(catalogType) {
  const type = normalizeCatalogType(catalogType);
  if (type === "blog") {
    return { $or: [{ catalogType: "blog" }, { catalogType: { $exists: false } }, { catalogType: "" }] };
  }
  return { catalogType: type };
}

// ==================== BLOG OPERATIONS ====================

// GET ALL BLOGS – always filter by type; default "blog" so we never return mixed types
export const getBlogs = async (req, res) => {
  try {
    await connectDB();
    const { status, type: catalogType } = req.query;
    const type = normalizeCatalogType(catalogType);
    const query = { ...catalogQuery(type) };
    if (status && status !== "all") {
      query.status = status;
    }

    const blogs = await Blog.find(query)
      .populate("category", "name")
      .populate("niche", "name")
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE BLOG
export const getBlogById = async (req, res) => {
  try {
    await connectDB();
    const blog = await Blog.findById(req.params.id)
      .populate("category", "name")
      .populate("niche", "name")
      .populate("author", "name email avatar bio socialLinks");
    
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// INCREMENT BLOG VIEW (called when someone visits the detail page on the site)
export const incrementBlogView = async (req, res) => {
  try {
    await connectDB();
    const result = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: "views" }
    );
    if (!result) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, data: { views: result.views } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    await connectDB();

    const categoryId = toObjectIdString(req.body.category);
    const authorId = toObjectIdString(req.body.author);
    const nicheId = req.body.niche ? toObjectIdString(req.body.niche) : null;

    if (!categoryId || !authorId) {
      return res.status(400).json({
        success: false,
        message: "Valid category and author are required (check that IDs are saved, not objects).",
      });
    }
    if (!req.body.title || !String(req.body.title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (req.body.description == null || !String(req.body.description).trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    let imageUrl = "";
    if (req.file) {
      try {
        const upload = await uploadToCloudinary(req.file.buffer, "blogs");
        imageUrl = upload.secure_url;
      } catch (imgErr) {
        console.error("Blog image upload failed:", imgErr?.message || imgErr);
        return res.status(500).json({
          success: false,
          message: imgErr?.message || "Image upload failed. Check Cloudinary configuration.",
        });
      }
    }

    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",").map(t => t.trim())) : [];
    const catalogType = normalizeCatalogType(req.body.catalogType);

    const blog = await Blog.create({
      catalogType,
      title: req.body.title,
      subTag: req.body.subTag || "",
      description: req.body.description,
      image: imageUrl,
      category: categoryId,
      niche: nicheId,
      author: authorId,
      tags,
      status: req.body.status || "draft",
    });

    // Update category blog count
    await BlogCategory.findByIdAndUpdate(categoryId, { $inc: { blogs: 1 } });

    // Update niche blog count if provided
    if (nicheId) {
      await BlogNiche.findByIdAndUpdate(nicheId, { $inc: { blogs: 1 } });
    }

    // Update author blog count
    await BlogAuthor.findByIdAndUpdate(authorId, { $inc: { blogs: 1 } });
    
    const populatedBlog = await Blog.findById(blog._id)
      .populate("category", "name")
      .populate("niche", "name")
      .populate("author", "name email avatar");
    
    res.status(201).json({ success: true, data: populatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    await connectDB();
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    // Handle old category/niche/author decrement
    if (blog.category && blog.category.toString() !== req.body.category) {
      await BlogCategory.findByIdAndUpdate(blog.category, { $inc: { blogs: -1 } });
    }
    if (blog.niche && (!req.body.niche || blog.niche.toString() !== req.body.niche)) {
      await BlogNiche.findByIdAndUpdate(blog.niche, { $inc: { blogs: -1 } });
    }
    if (blog.author && blog.author.toString() !== req.body.author) {
      await BlogAuthor.findByIdAndUpdate(blog.author, { $inc: { blogs: -1 } });
    }
    
    let imageUrl = blog.image;
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "blogs");
      imageUrl = upload.secure_url;
    }
    
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",").map(t => t.trim())) : blog.tags;
    
    const catalogType = req.body.catalogType !== undefined && req.body.catalogType !== null && req.body.catalogType !== ""
      ? normalizeCatalogType(req.body.catalogType)
      : (blog.catalogType || "blog");

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        catalogType,
        title: req.body.title,
        subTag: req.body.subTag || "",
        description: req.body.description,
        image: imageUrl,
        category: req.body.category,
        niche: req.body.niche || null,
        author: req.body.author,
        tags,
        status: req.body.status || blog.status,
      },
      { new: true }
    );
    
    // Update new category/niche/author counts
    if (blog.category?.toString() !== req.body.category) {
      await BlogCategory.findByIdAndUpdate(req.body.category, { $inc: { blogs: 1 } });
    }
    if (req.body.niche && (!blog.niche || blog.niche.toString() !== req.body.niche)) {
      await BlogNiche.findByIdAndUpdate(req.body.niche, { $inc: { blogs: 1 } });
    }
    if (blog.author?.toString() !== req.body.author) {
      await BlogAuthor.findByIdAndUpdate(req.body.author, { $inc: { blogs: 1 } });
    }
    
    const populatedBlog = await Blog.findById(updatedBlog._id)
      .populate("category", "name")
      .populate("niche", "name")
      .populate("author", "name email avatar");
    
    res.json({ success: true, data: populatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    await connectDB();
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    // Decrement counts
    if (blog.category) {
      await BlogCategory.findByIdAndUpdate(blog.category, { $inc: { blogs: -1 } });
    }
    if (blog.niche) {
      await BlogNiche.findByIdAndUpdate(blog.niche, { $inc: { blogs: -1 } });
    }
    if (blog.author) {
      await BlogAuthor.findByIdAndUpdate(blog.author, { $inc: { blogs: -1 } });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BLOG STATS – always filter by type; default "blog"
export const getBlogStats = async (req, res) => {
  try {
    await connectDB();
    const { type: catalogType } = req.query;
    const type = normalizeCatalogType(catalogType);
    const baseQuery = catalogQuery(type);

    const totalBlogs = await Blog.countDocuments(baseQuery);
    const published = await Blog.countDocuments({ ...baseQuery, status: "published" });
    const unpublished = await Blog.countDocuments({ ...baseQuery, status: "unpublished" });
    const draft = await Blog.countDocuments({ ...baseQuery, status: "draft" });
    
    const matchStage = [{ $match: baseQuery }];
    const viewsResult = await Blog.aggregate([...matchStage, { $group: { _id: null, total: { $sum: "$views" } } }]);
    const sharesResult = await Blog.aggregate([...matchStage, { $group: { _id: null, total: { $sum: "$shares" } } }]);
    const commentsResult = await Blog.aggregate([...matchStage, { $group: { _id: null, total: { $sum: "$comments" } } }]);
    const linksResult = await Blog.aggregate([...matchStage, { $group: { _id: null, total: { $sum: "$links" } } }]);
    
    res.json({
      success: true,
      data: {
        totalBlogs,
        published,
        unpublished,
        draft,
        views: viewsResult[0]?.total || 0,
        shares: sharesResult[0]?.total || 0,
        comments: commentsResult[0]?.total || 0,
        links: linksResult[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CATEGORY OPERATIONS ====================

// GET ALL CATEGORIES – always filter by type; default "blog"
export const getBlogCategories = async (req, res) => {
  try {
    await connectDB();
    const { type: catalogType } = req.query;
    const type = normalizeCatalogType(catalogType);
    const query = catalogQuery(type);
    const categories = await BlogCategory.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE CATEGORY
export const createBlogCategory = async (req, res) => {
  try {
    await connectDB();
    const catalogType = normalizeCatalogType(req.body.catalogType);
    const category = await BlogCategory.create({
      name: req.body.name,
      catalogType,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
export const updateBlogCategory = async (req, res) => {
  try {
    await connectDB();
    const category = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE CATEGORY
export const deleteBlogCategory = async (req, res) => {
  try {
    await connectDB();
    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    // Check if category has blogs
    const blogsCount = await Blog.countDocuments({ category: req.params.id });
    if (blogsCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete category with existing blogs" });
    }
    
    await BlogCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== NICHE OPERATIONS ====================

// GET ALL NICHES – always filter by type; default "blog"
export const getBlogNiches = async (req, res) => {
  try {
    await connectDB();
    const { category, type: catalogType } = req.query;
    const type = normalizeCatalogType(catalogType);
    const query = { ...catalogQuery(type) };
    if (category) query.category = category;
    const niches = await BlogNiche.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: niches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE NICHE
export const createBlogNiche = async (req, res) => {
  try {
    await connectDB();
    const catalogType = normalizeCatalogType(req.body.catalogType);
    const niche = await BlogNiche.create({
      name: req.body.name,
      category: req.body.category,
      catalogType,
    });
    const populatedNiche = await BlogNiche.findById(niche._id).populate("category", "name");
    res.status(201).json({ success: true, data: populatedNiche });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE NICHE
export const updateBlogNiche = async (req, res) => {
  try {
    await connectDB();
    const niche = await BlogNiche.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
      },
      { new: true }
    ).populate("category", "name");
    
    if (!niche) {
      return res.status(404).json({ success: false, message: "Niche not found" });
    }
    res.json({ success: true, data: niche });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE NICHE
export const deleteBlogNiche = async (req, res) => {
  try {
    await connectDB();
    const niche = await BlogNiche.findById(req.params.id);
    if (!niche) {
      return res.status(404).json({ success: false, message: "Niche not found" });
    }
    
    // Check if niche has blogs
    const blogsCount = await Blog.countDocuments({ niche: req.params.id });
    if (blogsCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete niche with existing blogs" });
    }
    
    await BlogNiche.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Niche deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== AUTHOR OPERATIONS ====================

// GET ALL AUTHORS – always filter by type; default "blog"
export const getBlogAuthors = async (req, res) => {
  try {
    await connectDB();
    const { type: catalogType } = req.query;
    const type = normalizeCatalogType(catalogType);
    const query = catalogQuery(type);
    const authors = await BlogAuthor.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE AUTHOR
export const getBlogAuthorById = async (req, res) => {
  try {
    await connectDB();
    const author = await BlogAuthor.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE AUTHOR
export const createBlogAuthor = async (req, res) => {
  try {
    await connectDB();
    
    let avatarUrl = "";
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "blog-authors");
      avatarUrl = upload.secure_url;
    }
    
    const catalogType = normalizeCatalogType(req.body.catalogType);
    const author = await BlogAuthor.create({
      catalogType,
      name: req.body.name,
      email: req.body.email,
      avatar: avatarUrl,
      bio: req.body.bio || "",
      socialLinks: {
        facebook: req.body.facebook || "",
        tiktok: req.body.tiktok || "",
        instagram: req.body.instagram || "",
        youtube: req.body.youtube || "",
        linkedin: req.body.linkedin || "",
        other: req.body.other || "",
      },
    });
    
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Author email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE AUTHOR
export const updateBlogAuthor = async (req, res) => {
  try {
    await connectDB();
    
    const author = await BlogAuthor.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    
    let avatarUrl = author.avatar;
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "blog-authors");
      avatarUrl = upload.secure_url;
    }
    
    const updatedAuthor = await BlogAuthor.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        avatar: avatarUrl,
        bio: req.body.bio || "",
        socialLinks: {
          facebook: req.body.facebook || "",
          tiktok: req.body.tiktok || "",
          instagram: req.body.instagram || "",
          youtube: req.body.youtube || "",
          linkedin: req.body.linkedin || "",
          other: req.body.other || "",
        },
      },
      { new: true }
    );
    
    res.json({ success: true, data: updatedAuthor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE AUTHOR
export const deleteBlogAuthor = async (req, res) => {
  try {
    await connectDB();
    
    const author = await BlogAuthor.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    
    // Check if author has blogs
    const blogsCount = await Blog.countDocuments({ author: req.params.id });
    if (blogsCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete author with existing blogs" });
    }
    
    await BlogAuthor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Author deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
