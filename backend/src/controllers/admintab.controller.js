import AdminTab from "../models/AdminTab.js";
import connectDB from "../config/db.js";

// GET ALL admin tabs
export const getAdminTabs = async (req, res) => {
  try {
    await connectDB();
    
    // Default tabs to auto-create if they don't exist
    const defaultTabs = [
      { label: "Dashboard", path: "/admin/dashboard", icon: "BarChart3", order: 0, subInfo: "Overview and statistics" },
      { label: "Orders", path: "/admin/orders", icon: "ShoppingCart", order: 1, subInfo: "Manage customer orders" },
      { label: "Categories", path: "/admin/categories", icon: "FolderTree", order: 2, subInfo: "Manage categories" },
      { label: "Products", path: "/admin/products", icon: "Package", order: 3, subInfo: "Manage products" },
      { label: "Blogging", path: "/admin/blogs", icon: "FileText", order: 4, subInfo: "Manage blog posts" },
      { label: "Assets Panel", path: "/admin/assets", icon: "ImageIcon", order: 5, subInfo: "Manage banners and assets" },
      { label: "Queries", path: "/admin/queries", icon: "MessageSquare", order: 6, subInfo: "Manage customer queries" },
      { label: "Reviews", path: "/admin/reviews", icon: "Star", order: 7, subInfo: "Manage product reviews" },
      { label: "Settings", path: "/admin/settings", icon: "Settings", order: 8, subInfo: "System settings" },
    ];

    // Auto-create missing tabs
    for (const tabData of defaultTabs) {
      let tab = await AdminTab.findOne({ path: tabData.path });
      if (!tab) {
        try {
          await AdminTab.create({
            label: tabData.label,
            path: tabData.path,
            icon: tabData.icon,
            enabled: true,
            order: tabData.order,
            subInfo: tabData.subInfo,
          });
          console.log(`✅ Auto-created ${tabData.label} admin tab`);
        } catch (createError) {
          console.error(`Failed to auto-create ${tabData.label} tab:`, createError);
          // Continue even if creation fails (might already exist)
        }
      } else {
        // Update icon and order if needed
        if (!tab.icon || tab.icon === "" || tab.icon === "LayoutDashboard" || tab.order !== tabData.order) {
          try {
            await AdminTab.findByIdAndUpdate(tab._id, { 
              icon: tabData.icon,
              order: tabData.order,
              subInfo: tabData.subInfo || tab.subInfo
            });
            console.log(`✅ Updated ${tabData.label} admin tab`);
          } catch (updateError) {
            console.error(`Failed to update ${tabData.label} tab:`, updateError);
          }
        }
      }
    }
    
    // Always fetch all tabs after potential creation
    const tabs = await AdminTab.find().sort({ order: 1 });
    res.json({ success: true, data: tabs });
  } catch (error) {
    console.error("Error in getAdminTabs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET enabled admin tabs only (for admin sidebar)
export const getEnabledAdminTabs = async (req, res) => {
  try {
    await connectDB();
    
    // Default tabs to auto-create if they don't exist
    const defaultTabs = [
      { label: "Dashboard", path: "/admin/dashboard", icon: "BarChart3", order: 0, subInfo: "Overview and statistics" },
      { label: "Orders", path: "/admin/orders", icon: "ShoppingCart", order: 1, subInfo: "Manage customer orders" },
      { label: "Categories", path: "/admin/categories", icon: "FolderTree", order: 2, subInfo: "Manage categories" },
      { label: "Products", path: "/admin/products", icon: "Package", order: 3, subInfo: "Manage products" },
      { label: "Blogging", path: "/admin/blogs", icon: "FileText", order: 4, subInfo: "Manage blog posts" },
      { label: "Assets Panel", path: "/admin/assets", icon: "ImageIcon", order: 5, subInfo: "Manage banners and assets" },
      { label: "Queries", path: "/admin/queries", icon: "MessageSquare", order: 6, subInfo: "Manage customer queries" },
      { label: "Reviews", path: "/admin/reviews", icon: "Star", order: 7, subInfo: "Manage product reviews" },
      { label: "Settings", path: "/admin/settings", icon: "Settings", order: 8, subInfo: "System settings" },
    ];

    // Auto-create missing tabs
    for (const tabData of defaultTabs) {
      let tab = await AdminTab.findOne({ path: tabData.path });
      if (!tab) {
        try {
          await AdminTab.create({
            label: tabData.label,
            path: tabData.path,
            icon: tabData.icon,
            enabled: true,
            order: tabData.order,
            subInfo: tabData.subInfo,
          });
          console.log(`✅ Auto-created ${tabData.label} admin tab`);
        } catch (createError) {
          console.error(`Failed to auto-create ${tabData.label} tab:`, createError);
        }
      } else {
        // Update icon and order if needed
        if (!tab.icon || tab.icon === "" || tab.icon === "LayoutDashboard" || tab.order !== tabData.order) {
          try {
            await AdminTab.findByIdAndUpdate(tab._id, { 
              icon: tabData.icon,
              order: tabData.order,
              subInfo: tabData.subInfo || tab.subInfo
            });
            console.log(`✅ Updated ${tabData.label} admin tab`);
          } catch (updateError) {
            console.error(`Failed to update ${tabData.label} tab:`, updateError);
          }
        }
      }
    }
    
    // Always fetch enabled tabs after potential creation
    const tabs = await AdminTab.find({ enabled: true }).sort({ order: 1 });
    res.json({ success: true, data: tabs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE admin tab
export const createAdminTab = async (req, res) => {
  try {
    await connectDB();
    
    const tab = await AdminTab.create({
      label: req.body.label,
      path: req.body.path,
      icon: req.body.icon || "",
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      order: req.body.order || 0,
      subInfo: req.body.subInfo || "",
    });
    res.status(201).json({ success: true, data: tab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE admin tab
export const updateAdminTab = async (req, res) => {
  try {
    await connectDB();
    
    const tab = await AdminTab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tab) {
      return res.status(404).json({ success: false, message: "Tab not found" });
    }
    res.json({ success: true, data: tab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE admin tab
export const deleteAdminTab = async (req, res) => {
  try {
    await connectDB();
    
    await AdminTab.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Tab deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};













