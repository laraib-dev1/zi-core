import LandingSection from "../models/LandingSection.js";
import CatalogType from "../models/CatalogType.js";
import connectDB from "../config/db.js";

// Map catalog slugs to existing section IDs (legacy mapping)
const CATALOG_SLUG_TO_SECTION_ID = {
  services: "services",
  projects: "portfolio",
  courses: "courses",
  applications: "applications",
};

const DEFAULT_SECTIONS = [
  { sectionId: "hero", label: "Hero Banner", order: 0 },
  { sectionId: "about", label: "About (Portfolio Detail)", order: 1 },
  { sectionId: "cta-banner-1", label: "CTA Banner 1", order: 2 },
  { sectionId: "text-image", label: "Text + Image", order: 3 },
  { sectionId: "how-we-work", label: "How We Work", order: 4 },
  { sectionId: "cta-banner-2", label: "CTA Banner 2", order: 5 },
  { sectionId: "services", label: "Services", order: 6 },
  { sectionId: "courses", label: "Courses", order: 7 },
  { sectionId: "portfolio", label: "Portfolio Grid", order: 8 },
  { sectionId: "applications", label: "Applications", order: 9 },
  { sectionId: "zi-core-package", label: "Zi Core Development Package", order: 9.5 },
  { sectionId: "feature-cards", label: "Feature Cards", order: 10 },
  { sectionId: "cta-banner-3", label: "CTA Banner 3", order: 11 },
  { sectionId: "other-pages", label: "Other Pages (Detail Sidebar)", order: 12 },
  { sectionId: "testimonials", label: "Testimonials", order: 13 },
  { sectionId: "faqs", label: "FAQs", order: 14 },
  { sectionId: "help-banner-1", label: "Help Banner 1", order: 15 },
  { sectionId: "contact", label: "Contact", order: 16 },
  { sectionId: "cta-banner-4", label: "CTA Banner 4", order: 17 },
  { sectionId: "scale-operations", label: "Scale Operations Banner", order: 18 },
  { sectionId: "feature-service", label: "Feature Service Card", order: 19 },
  { sectionId: "hero-business", label: "Hero Business", order: 20 },
  { sectionId: "team", label: "Team", order: 21 },
  { sectionId: "unlock-potential", label: "Unlock Potential", order: 22 },
  { sectionId: "call-to-action", label: "Call To Action", order: 23 },
  { sectionId: "features-details", label: "Features Details", order: 24 },
  { sectionId: "clients", label: "Clients", order: 25 },
  { sectionId: "excellence", label: "Excellence", order: 26 },
  { sectionId: "help-banner-2", label: "Help Banner 2 (Card)", order: 27 },
  { sectionId: "event-banner", label: "Event Banner", order: 28 },
  { sectionId: "limited-offer", label: "Limited Offer Banner", order: 29 },
  { sectionId: "coming-soon", label: "Coming Soon", order: 30 },
];

async function ensureDefaultSections() {
  for (const data of DEFAULT_SECTIONS) {
    const existing = await LandingSection.findOne({ sectionId: data.sectionId });
    if (!existing) {
      try {
        await LandingSection.create({
          sectionId: data.sectionId,
          label: data.label,
          enabled: true,
          order: data.order,
        });
        console.log(`✅ Auto-created landing section: ${data.label}`);
      } catch (createError) {
        console.error(`Failed to auto-create ${data.sectionId}:`, createError);
      }
    }
  }
  await syncCatalogTypeSections();
}

async function syncCatalogTypeSections() {
  try {
    const catalogTypes = await CatalogType.find({ showInAdmin: true }).sort({ order: 1 });
    const maxOrder = await LandingSection.findOne().sort({ order: -1 }).select("order");
    let nextOrder = (maxOrder?.order ?? -1) + 1;
    for (const ct of catalogTypes) {
      const sectionId = CATALOG_SLUG_TO_SECTION_ID[ct.slug] || `catalog-${ct.slug}`;
      const existing = await LandingSection.findOne({ sectionId });
      if (!existing) {
        await LandingSection.create({
          sectionId,
          label: ct.label,
          enabled: true,
          order: nextOrder++,
        });
        console.log(`✅ Auto-created catalog section: ${ct.label} (${sectionId})`);
      }
    }
  } catch (err) {
    console.error("Failed to sync catalog sections:", err);
  }
}

export const getLandingSections = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultSections();
    const sections = await LandingSection.find().sort({ order: 1 });
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnabledLandingSections = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultSections();
    const sections = await LandingSection.find({ enabled: true }).sort({ order: 1 });
    res.json({ success: true, data: sections.map((s) => s.sectionId) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLandingSection = async (req, res) => {
  try {
    await connectDB();
    const section = await LandingSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const createLandingSection = async (req, res) => {
  try {
    await connectDB();
    const { label } = req.body;
    if (!label || typeof label !== "string" || !label.trim()) {
      return res.status(400).json({ success: false, message: "Label is required" });
    }
    const baseId = slugify(label.trim());
    let sectionId = `custom-${baseId}`;
    let suffix = 0;
    while (await LandingSection.findOne({ sectionId })) {
      suffix += 1;
      sectionId = `custom-${baseId}-${suffix}`;
    }
    const maxOrder = await LandingSection.findOne().sort({ order: -1 }).select("order");
    const order = (maxOrder?.order ?? -1) + 1;
    const section = await LandingSection.create({
      sectionId,
      label: label.trim(),
      enabled: false,
      order,
      isCustom: true,
      code: "",
    });
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
