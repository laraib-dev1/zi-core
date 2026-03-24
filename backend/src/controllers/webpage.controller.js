import WebPage from "../models/WebPage.js";
import connectDB from "../config/db.js";

// Core site pages (all routes in App – active and commented) so they show in Developer > Web Pages
const DEFAULT_WEBPAGES = [
  { title: "Home (2nd Landing)", slug: "/", icon: "", order: 0, subInfo: "Second landing page", location: "nav" },
  { title: "Project Detail", slug: "/project/:id", icon: "", order: 1, subInfo: "Project detail page", location: "footer" },
  { title: "Service Detail", slug: "/service/:id", icon: "", order: 2, subInfo: "Service detail page", location: "footer" },
  { title: "Course Detail", slug: "/course/:id", icon: "", order: 3, subInfo: "Course detail page", location: "footer" },
  { title: "Login", slug: "/login", icon: "", order: 4, subInfo: "Login page", location: "footer" },
  { title: "Privacy Policy", slug: "/privacy-policy", icon: "", order: 5, subInfo: "Privacy policy", location: "footer" },
  { title: "Terms & Conditions", slug: "/terms-conditions", icon: "", order: 6, subInfo: "Terms and conditions", location: "footer" },
  { title: "FAQs", slug: "/faqs", icon: "", order: 7, subInfo: "Frequently asked questions", location: "footer" },
  { title: "Contact Us", slug: "/contact-us", icon: "", order: 8, subInfo: "Get in touch", location: "footer" },
  { title: "About Us", slug: "/about-us", icon: "", order: 9, subInfo: "About the company", location: "footer" },
  { title: "Blogs", slug: "/blogs", icon: "", order: 10, subInfo: "Blog listing", location: "footer" },
  { title: "Blog Detail", slug: "/blog/:id", icon: "", order: 11, subInfo: "Single blog post", location: "footer" },
  { title: "User Profile", slug: "/profile", icon: "", order: 12, subInfo: "User profile (protected)", location: "footer" },
  { title: "Shop", slug: "/shop", icon: "", order: 13, subInfo: "Shop listing", location: "footer" },
];

async function ensureDefaultWebPages() {
  for (const pageData of DEFAULT_WEBPAGES) {
    const existing = await WebPage.findOne({ slug: pageData.slug });
    if (!existing) {
      try {
        await WebPage.create({
          title: pageData.title,
          slug: pageData.slug,
          icon: pageData.icon,
          enabled: pageData.slug === "/" || pageData.slug === "/contact-us",
          order: pageData.order,
          subInfo: pageData.subInfo,
          location: pageData.location,
        });
        console.log(`✅ Auto-created webpage: ${pageData.title}`);
      } catch (createError) {
        console.error(`Failed to auto-create ${pageData.title}:`, createError);
      }
    }
  }
}

// GET ALL web pages
export const getWebPages = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultWebPages();
    const pages = await WebPage.find().sort({ order: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error in getWebPages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET enabled web pages only (for navbar/footer)
export const getEnabledWebPages = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultWebPages();
    const pages = await WebPage.find({ enabled: true }).sort({ order: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET enabled web pages by location (for footer/navbar)
export const getEnabledWebPagesByLocation = async (req, res) => {
  try {
    await connectDB();
    await ensureDefaultWebPages();
    const { location } = req.params; // "nav", "footer", or "both"
    const pages = await WebPage.find({ 
      enabled: true,
      $or: [
        { location: location },
        { location: "both" }
      ]
    }).sort({ order: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE web page
export const createWebPage = async (req, res) => {
  try {
    await connectDB();
    
    const page = await WebPage.create({
      title: req.body.title,
      slug: req.body.slug,
      icon: req.body.icon || "",
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      order: req.body.order || 0,
      subInfo: req.body.subInfo || "",
      location: req.body.location || "footer",
    });
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE web page
export const updateWebPage = async (req, res) => {
  try {
    await connectDB();
    
    const page = await WebPage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE web page
export const deleteWebPage = async (req, res) => {
  try {
    await connectDB();
    
    await WebPage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

