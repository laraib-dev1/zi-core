import Footer from "../models/Footer.js";

// GET footer settings
export const getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    if (!footer) {
      footer = await Footer.create({
        sections: [],
        socialLinks: {},
        copyright: "",
        description: "",
        showPreview: true,
        showCategories: false,
        showProducts: false,
        showSocialIcons: false,
        showSocialLinks: false,
        gridSettings: {
          productsPerRow: 4,
          blogsPerRow: 4,
        },
      });
    }
    
    res.json({ success: true, data: footer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE footer settings
export const updateFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    // Explicitly handle showPreview to ensure boolean value is saved (including false)
    const updateData = { ...req.body };
    
    // Helper function to convert to boolean
    const toBoolean = (value) => {
      if (value === false || value === "false" || value === 0 || value === "0" || value === null) {
        return false;
      }
      return value === true || value === "true" || value === 1 || value === "1";
    };

    // Always set boolean fields explicitly if they're provided (handles both true and false)
    if (req.body.showPreview !== undefined) {
      updateData.showPreview = toBoolean(req.body.showPreview);
    }
    if (req.body.showCategories !== undefined) {
      updateData.showCategories = toBoolean(req.body.showCategories);
    }
    if (req.body.showProducts !== undefined) {
      updateData.showProducts = toBoolean(req.body.showProducts);
    }
    if (req.body.showSocialIcons !== undefined) {
      updateData.showSocialIcons = toBoolean(req.body.showSocialIcons);
    }
    if (req.body.showSocialLinks !== undefined) {
      updateData.showSocialLinks = toBoolean(req.body.showSocialLinks);
    }

    console.log("Backend received updateData:", JSON.stringify(updateData));
    console.log("Boolean values:", {
      showPreview: updateData.showPreview,
      showCategories: updateData.showCategories,
      showProducts: updateData.showProducts,
      showSocialIcons: updateData.showSocialIcons,
      showSocialLinks: updateData.showSocialLinks,
    });

    if (!footer) {
      // Create new footer with the update data
      footer = await Footer.create(updateData);
    } else {
      // Update existing footer - use $set to ensure false values are saved
      footer = await Footer.findOneAndUpdate(
        { _id: footer._id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    console.log("Backend saved footer - showPreview:", footer.showPreview);
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};











