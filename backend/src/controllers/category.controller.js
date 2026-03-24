// src/controllers/category.controller.js
import Category from "../models/Category.js";
import { uploadToCloudinary } from "../config/cloudinary.js";


// CREATE
export const addCategory = async (req, res) => {
  try {
    let iconUrl = "/default-category.png";

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "categories");
      iconUrl = upload.secure_url;
    }

    const category = await Category.create({
      name: req.body.name,
      icon: iconUrl,
      products: req.body.products || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET ALL
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
export const updateCategory = async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      products: req.body.products,
    };

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "categories");
      update.icon = upload.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE
export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ success: false, message: "Category ID required" });

  try {
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

