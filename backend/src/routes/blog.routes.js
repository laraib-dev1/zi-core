import express from "express";
import multer from "multer";
import {
  getBlogs,
  getBlogById,
  incrementBlogView,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogNiches,
  createBlogNiche,
  updateBlogNiche,
  deleteBlogNiche,
  getBlogAuthors,
  getBlogAuthorById,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
} from "../controllers/blog.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Blog routes
router.get("/", getBlogs);
router.get("/stats", getBlogStats);
router.post("/:id/view", incrementBlogView);
router.get("/:id", getBlogById);
router.post("/", upload.single("image"), createBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);

// Category routes
router.get("/categories/all", getBlogCategories);
router.post("/categories", createBlogCategory);
router.put("/categories/:id", updateBlogCategory);
router.delete("/categories/:id", deleteBlogCategory);

// Niche routes
router.get("/niches/all", getBlogNiches);
router.post("/niches", createBlogNiche);
router.put("/niches/:id", updateBlogNiche);
router.delete("/niches/:id", deleteBlogNiche);

// Author routes
router.get("/authors/all", getBlogAuthors);
router.get("/authors/:id", getBlogAuthorById);
router.post("/authors", upload.single("avatar"), createBlogAuthor);
router.put("/authors/:id", upload.single("avatar"), updateBlogAuthor);
router.delete("/authors/:id", deleteBlogAuthor);

export default router;
