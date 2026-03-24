import mongoose from "mongoose";

// ContentPage schema stores Privacy Policy, Terms & Conditions, and FAQs
const ContentPageSchema = new mongoose.Schema(
  {
    // Type: "privacy", "terms", or "faqs"
    type: { 
      type: String, 
      required: true, 
      enum: ["privacy", "terms", "faqs"],
      unique: true 
    },
    
    // Title shown on the page
    title: { type: String, required: true, default: "" },
    
    // Subtitle shown below title
    subTitle: { type: String, default: "" },
    
    // Main content (HTML from rich text editor)
    description: { type: String, default: "" },
    
    // For FAQs: array of question/answer pairs
    faqs: [{
      question: { type: String, required: true },
      answer: { type: String, required: true }
    }],
    
    // Last updated timestamp
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ContentPage = mongoose.models.ContentPage || mongoose.model("ContentPage", ContentPageSchema);
export default ContentPage;















