import ProfilePage from "../models/ProfilePage.js";
import BaseProfileTab from "../models/BaseProfileTab.js";
import connectDB from "../config/db.js";

// GET ALL profile pages
export const getProfilePages = async (req, res) => {
  try {
    await connectDB();
    const pages = await ProfilePage.find().sort({ order: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching profile pages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile pages" });
  }
};

// GET enabled profile pages only
export const getEnabledProfilePages = async (req, res) => {
  try {
    await connectDB();
    const pages = await ProfilePage.find({ enabled: true }).sort({ order: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching enabled profile pages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch enabled profile pages" });
  }
};

// GET profile page by slug
export const getProfilePageBySlug = async (req, res) => {
  try {
    await connectDB();
    const page = await ProfilePage.findOne({ slug: req.params.slug, enabled: true });
    if (!page) {
      return res.status(404).json({ success: false, message: "Profile page not found" });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching profile page:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile page" });
  }
};

// CREATE profile page
export const createProfilePage = async (req, res) => {
  try {
    await connectDB();
    const page = await ProfilePage.create(req.body);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("Error creating profile page:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to create profile page" });
  }
};

// UPDATE profile page
export const updateProfilePage = async (req, res) => {
  try {
    await connectDB();
    const page = await ProfilePage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!page) {
      return res.status(404).json({ success: false, message: "Profile page not found" });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error("Error updating profile page:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to update profile page" });
  }
};

// DELETE profile page
export const deleteProfilePage = async (req, res) => {
  try {
    await connectDB();
    const page = await ProfilePage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: "Profile page not found" });
    }
    res.json({ success: true, message: "Profile page deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile page:", error);
    res.status(500).json({ success: false, message: "Failed to delete profile page" });
  }
};

// ========== BASE PROFILE TABS API ==========

// GET ALL base profile tabs
export const getBaseProfileTabs = async (req, res) => {
  try {
    await connectDB();
    
    // Default tabs to auto-create if they don't exist
    const defaultTabs = [
      { _id: "dashboard", title: "Dashboard", slug: "/profile?tab=dashboard", icon: "LayoutDashboard", enabled: true, subInfo: "User dashboard overview", order: 1 },
      { _id: "profile", title: "Profile", slug: "/profile?tab=profile", icon: "User", enabled: true, subInfo: "User profile settings", order: 2 },
      { _id: "addresses", title: "Addresses", slug: "/profile?tab=addresses", icon: "MapPin", enabled: true, subInfo: "Manage delivery addresses", order: 3 },
      { _id: "orders", title: "Orders", slug: "/profile?tab=orders", icon: "Package", enabled: true, subInfo: "Order history", order: 4 },
      { _id: "wishlist", title: "Wishlist", slug: "/profile?tab=wishlist", icon: "Heart", enabled: true, subInfo: "Saved products", order: 5 },
      { _id: "queries", title: "Support", slug: "/profile?tab=queries", icon: "MessageSquare", enabled: true, subInfo: "Support & help", order: 6 },
      { _id: "reviews", title: "Reviews", slug: "/profile?tab=reviews", icon: "Star", enabled: true, subInfo: "Product reviews", order: 7 },
    ];

    // Auto-create missing tabs
    for (const tabData of defaultTabs) {
      let tab = await BaseProfileTab.findById(tabData._id);
      if (!tab) {
        try {
          await BaseProfileTab.create(tabData);
          console.log(`✅ Auto-created ${tabData.title} base profile tab`);
        } catch (createError) {
          console.error(`Failed to auto-create ${tabData.title} tab:`, createError);
        }
      } else {
        // Update fields if needed
        if (tab.title !== tabData.title || tab.slug !== tabData.slug || tab.icon !== tabData.icon || tab.order !== tabData.order) {
          try {
            await BaseProfileTab.findByIdAndUpdate(tabData._id, {
              title: tabData.title,
              slug: tabData.slug,
              icon: tabData.icon,
              order: tabData.order,
              subInfo: tabData.subInfo || tab.subInfo
            });
            console.log(`✅ Updated ${tabData.title} base profile tab`);
          } catch (updateError) {
            console.error(`Failed to update ${tabData.title} tab:`, updateError);
          }
        }
      }
    }
    
    // Always fetch all tabs after potential creation
    const tabs = await BaseProfileTab.find().sort({ order: 1 });
    res.json({ success: true, data: tabs });
  } catch (error) {
    console.error("Error in getBaseProfileTabs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET enabled base profile tabs only (for user profile page)
export const getEnabledBaseProfileTabs = async (req, res) => {
  try {
    await connectDB();
    
    // Default tabs to auto-create if they don't exist
    const defaultTabs = [
      { _id: "dashboard", title: "Dashboard", slug: "/profile?tab=dashboard", icon: "LayoutDashboard", enabled: true, subInfo: "User dashboard overview", order: 1 },
      { _id: "profile", title: "Profile", slug: "/profile?tab=profile", icon: "User", enabled: true, subInfo: "User profile settings", order: 2 },
      { _id: "addresses", title: "Addresses", slug: "/profile?tab=addresses", icon: "MapPin", enabled: true, subInfo: "Manage delivery addresses", order: 3 },
      { _id: "orders", title: "Orders", slug: "/profile?tab=orders", icon: "Package", enabled: true, subInfo: "Order history", order: 4 },
      { _id: "wishlist", title: "Wishlist", slug: "/profile?tab=wishlist", icon: "Heart", enabled: true, subInfo: "Saved products", order: 5 },
      { _id: "queries", title: "Support", slug: "/profile?tab=queries", icon: "MessageSquare", enabled: true, subInfo: "Support & help", order: 6 },
      { _id: "reviews", title: "Reviews", slug: "/profile?tab=reviews", icon: "Star", enabled: true, subInfo: "Product reviews", order: 7 },
    ];

    // Auto-create missing tabs
    for (const tabData of defaultTabs) {
      let tab = await BaseProfileTab.findById(tabData._id);
      if (!tab) {
        try {
          await BaseProfileTab.create(tabData);
          console.log(`✅ Auto-created ${tabData.title} base profile tab`);
        } catch (createError) {
          console.error(`Failed to auto-create ${tabData.title} tab:`, createError);
        }
      }
    }
    
    // Always fetch enabled tabs after potential creation
    const tabs = await BaseProfileTab.find({ enabled: true }).sort({ order: 1 });
    res.json({ success: true, data: tabs });
  } catch (error) {
    console.error("Error in getEnabledBaseProfileTabs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE base profile tab
export const updateBaseProfileTab = async (req, res) => {
  try {
    await connectDB();
    
    const tab = await BaseProfileTab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, upsert: false }
    );
    if (!tab) {
      return res.status(404).json({ success: false, message: "Base profile tab not found" });
    }
    res.json({ success: true, data: tab });
  } catch (error) {
    console.error("Error updating base profile tab:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
