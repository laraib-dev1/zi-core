import ContentPage from "../models/ContentPage.js";
import connectDB from "../config/db.js";

// Get content by type (privacy, terms, or faqs)
export const getContentByType = async (req) => {
  await connectDB();
  const { type } = req.params;
  
  if (!["privacy", "terms", "faqs"].includes(type)) {
    throw new Error("Invalid content type. Must be 'privacy', 'terms', or 'faqs'");
  }
  
  const content = await ContentPage.findOne({ type });
  
  // Return default structure if not found
  if (!content) {
    return {
      type,
      title: type === "privacy" ? "Privacy Policy" : type === "terms" ? "Terms & Conditions" : "Frequently Asked Questions",
      subTitle: "Legal page related Sub Title",
      description: "",
      faqs: [],
      lastUpdated: new Date()
    };
  }
  
  return content;
};

// Get all content pages (admin)
export const getAllContent = async () => {
  await connectDB();
  const contents = await ContentPage.find().sort({ type: 1 });
  return contents;
};

// Create or update content page
export const upsertContent = async (req) => {
  await connectDB();
  const { type } = req.params;
  const { title, subTitle, description, faqs } = req.body;
  
  if (!["privacy", "terms", "faqs"].includes(type)) {
    throw new Error("Invalid content type. Must be 'privacy', 'terms', or 'faqs'");
  }
  
  const updateData = {
    title: title || "",
    subTitle: subTitle || "",
    description: description || "",
    lastUpdated: new Date()
  };
  
  // For FAQs, include the faqs array
  if (type === "faqs" && Array.isArray(faqs)) {
    updateData.faqs = faqs;
  }
  
  const content = await ContentPage.findOneAndUpdate(
    { type },
    updateData,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  return content;
};















