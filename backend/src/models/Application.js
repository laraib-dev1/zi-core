import mongoose from "mongoose";

const applicationDownloadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["apk", "ios", "windows", "website", "exe", "playstore", "other"],
      default: "other",
    },
    label: { type: String, trim: true },
    url: { type: String, trim: true, default: "" },
    /** Optional: Google Drive / Dropbox / OneDrive share URL; public site prefers this over uploaded file. */
    storageUrl: { type: String, trim: true, default: "" },
    fileUrl: { type: String, trim: true, default: "" },
    fileName: { type: String, trim: true, default: "" },
    fileSize: { type: Number, default: 0 },
    /** When true, stored bytes are not the raw installer; use download proxy. */
    setupFileGzipped: { type: Boolean, default: false },
    /** How bytes on Cloudinary were compressed: none | gzip | brotli (Brotli often needed to get under free-tier 10 MiB). */
    setupFileEncoding: { type: String, enum: ["none", "gzip", "brotli"], default: "none" },
    sizeText: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subTag: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "" },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ["published", "unpublished", "draft"], default: "draft" },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    latestVersionLabel: { type: String, trim: true, default: "" },
    latestVersionSize: { type: String, trim: true, default: "" },
    downloadsList: { type: [applicationDownloadSchema], default: [] },
    appInfo: {
      domain: { type: String, trim: true, default: "" },
      version: { type: String, trim: true, default: "" },
      buildWith: { type: String, trim: true, default: "" },
      intro: { type: String, trim: true, default: "" },
      starsEnabled: { type: Boolean, default: false },
      stars: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      downloadsEnabled: { type: Boolean, default: false },
      datesEnabled: { type: Boolean, default: false },
      thumbnailEnabled: { type: Boolean, default: true },
      bannerEnabled: { type: Boolean, default: true },
      imagesEnabled: { type: Boolean, default: true },
      descriptionTabEnabled: { type: Boolean, default: true },
      featuresTabEnabled: { type: Boolean, default: true },
      guideTabEnabled: { type: Boolean, default: true },
      supportTabEnabled: { type: Boolean, default: true },
      downloadsDisplay: { type: String, trim: true, default: "" },
      releaseDate: { type: String, trim: true, default: "" },
      updateDate: { type: String, trim: true, default: "" },
    },
    media: {
      banner: { type: String, trim: true, default: "" },
      inner: { type: String, trim: true, default: "" },
      screenshots: [{ type: String, trim: true }],
    },
    featuresHtml: { type: String, default: "" },
    guideHtml: { type: String, default: "" },
    helpEnabled: { type: Boolean, default: false },
    helpHtml: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
