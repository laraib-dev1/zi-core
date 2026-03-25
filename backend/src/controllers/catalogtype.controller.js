import CatalogType from "../models/CatalogType.js";
import LandingSection from "../models/LandingSection.js";
import connectDB from "../config/db.js";

const CATALOG_SLUG_TO_SECTION_ID = {
  services: "services",
  projects: "portfolio",
  courses: "courses",
};

const DEFAULT_TYPES = [
  { slug: "blog", label: "Blog", showInAdmin: true, order: 0 },
  { slug: "projects", label: "Projects", showInAdmin: true, order: 1 },
  { slug: "courses", label: "Courses", showInAdmin: true, order: 2 },
  { slug: "services", label: "Services", showInAdmin: true, order: 3 },
];

async function ensureDefaultTypes() {
  for (const t of DEFAULT_TYPES) {
    const existing = await CatalogType.findOne({ slug: t.slug });
    if (!existing) {
      await CatalogType.create(t);
      console.log(`✅ Auto-created catalog type: ${t.label}`);
    }
  }
}

export const getCatalogTypes = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultTypes();
    const types = await CatalogType.find({ slug: { $ne: "applications" } }).sort({ order: 1 });
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnabledCatalogTypes = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultTypes();
    const types = await CatalogType.find({ showInAdmin: true, slug: { $ne: "applications" } }).sort({ order: 1 });
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCatalogType = async (req, res) => {
  try {
    await connectDB();
    const slug = (req.body.slug || "").toLowerCase().replace(/\s+/g, "-");
    const type = await CatalogType.create({
      slug,
      label: req.body.label || req.body.slug,
      showInAdmin: req.body.showInAdmin !== undefined ? req.body.showInAdmin : true,
      order: req.body.order ?? (await CatalogType.countDocuments()),
    });
    const sectionId = CATALOG_SLUG_TO_SECTION_ID[slug] || `catalog-${slug}`;
    const existingSection = await LandingSection.findOne({ sectionId });
    if (!existingSection) {
      const maxOrder = await LandingSection.findOne().sort({ order: -1 }).select("order");
      await LandingSection.create({
        sectionId,
        label: type.label,
        enabled: true,
        order: (maxOrder?.order ?? -1) + 1,
      });
    }
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Catalog type with this slug already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCatalogType = async (req, res) => {
  try {
    await connectDB();
    const type = await CatalogType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) {
      return res.status(404).json({ success: false, message: "Catalog type not found" });
    }
    res.json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCatalogType = async (req, res) => {
  try {
    await connectDB();
    const type = await CatalogType.findByIdAndDelete(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: "Catalog type not found" });
    }
    res.json({ success: true, message: "Catalog type deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
