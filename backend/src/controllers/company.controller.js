import Company from "../models/Company.js";
import connectDB from "../config/db.js";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// Lazy Cloudinary config so GET /api/company works without CLOUDINARY_* env vars
let cloudinaryConfigured = false;
const ensureCloudinary = () => {
  if (cloudinaryConfigured) return;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
  }
};

// Helper to upload image (compatible with disk + memory storage)
const uploadImage = async (file, folder = "company") => {
  if (!file) return "";
  ensureCloudinary();

  // Vercel / memory storage → use buffer
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  }

  // Local disk storage → use file.path
  if (file.path) {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder,
    });
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      // ignore
    }
    return result.secure_url;
  }

  return "";
};

// Helper to download image from URL and upload to Cloudinary
const downloadAndUploadImage = async (imageUrl, folder = "company/social-posts") => {
  if (!imageUrl || typeof imageUrl !== 'string') return "";
  ensureCloudinary();
  if (!cloudinaryConfigured) return "";

  // If already a Cloudinary URL, return as is
  if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }
  
  // If it's a data URL (base64), skip
  if (imageUrl.startsWith('data:')) {
    return "";
  }
  
  try {
    console.log(`Downloading image from URL: ${imageUrl}`);
    
    let imageBuffer;
    
    // Use fetch (Node 18+ has built-in fetch)
    try {
      // For Facebook URLs, use more realistic headers
      const isFacebookUrl = imageUrl.includes('fbcdn.net') || imageUrl.includes('scontent.');
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      };
      
      if (isFacebookUrl) {
        headers['Referer'] = 'https://www.facebook.com/';
        headers['Origin'] = 'https://www.facebook.com';
      }
      
      const response = await fetch(imageUrl, {
        headers: headers,
        redirect: 'follow'
      });
      
      if (!response.ok) {
        console.error(`Failed to download image: ${response.status} ${response.statusText}`);
        return "";
      }
      
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } catch (fetchError) {
      // Fallback to http/https for older Node versions or if fetch fails
      console.log("Fetch failed, trying http/https:", fetchError.message);
      imageBuffer = await new Promise((resolve) => {
        try {
          const urlObj = new URL(imageUrl);
          const client = urlObj.protocol === 'https:' ? https : http;
          
          const isFacebookUrl = imageUrl.includes('fbcdn.net') || imageUrl.includes('scontent.');
          const httpHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          };
          
          if (isFacebookUrl) {
            httpHeaders['Referer'] = 'https://www.facebook.com/';
            httpHeaders['Origin'] = 'https://www.facebook.com';
          }
          
          client.get(imageUrl, {
            headers: httpHeaders
          }, (res) => {
            if (res.statusCode !== 200) {
              console.error(`Failed to download image: ${res.statusCode}`);
              return resolve(null);
            }
            
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
              resolve(Buffer.concat(chunks));
            });
          }).on('error', (err) => {
            console.error(`Error downloading image:`, err);
            resolve(null);
          });
        } catch (urlError) {
          console.error("Invalid URL:", urlError);
          resolve(null);
        }
      });
    }
    
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error("Downloaded image buffer is empty");
      return "";
    }
    
    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) {
            console.error("Error uploading to Cloudinary:", err);
            return reject(err);
          }
          console.log(`Successfully uploaded image to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );
      stream.end(imageBuffer);
    });
    
  } catch (error) {
    console.error("Error in downloadAndUploadImage:", error);
    return "";
  }
};

// Default company for when DB is empty (no Cloudinary or DB required)
const defaultCompany = () => ({
  company: "",
  slogan: "",
  email: "",
  phone: "",
  supportEmail: "",
  address: "",
  logo: "",
  favicon: "",
  socialLinks: { facebook: "", tiktok: "", instagram: "", youtube: "", linkedin: "", twitter: "", skype: "", other: "" },
  socialPosts: [],
  brandTheme: { primary: "#8C5934", accent: "", dark: "", light: "" },
  copyright: "",
  description: "",
  authTagline: "Handcrafted essentials with a touch of elegance.",
});

// GET company data (or create default if none exists)
export const getCompany = async (req, res) => {
  try {
    await connectDB();
    
    let company = await Company.findOne();
    
    // If no company exists, create a default one
    if (!company) {
      company = await Company.create({});
    }
    
    // Auto-migrate Facebook CDN URLs to Cloudinary URLs (only if Cloudinary is configured)
    ensureCloudinary();
    if (cloudinaryConfigured && company.socialPosts && Array.isArray(company.socialPosts) && company.socialPosts.length > 0) {
      let needsUpdate = false;
      const updatedSocialPosts = await Promise.all(
        company.socialPosts.map(async (post) => {
          if (!post || !post.image || typeof post.image !== 'string') {
            return post;
          }
          
          // Check if it's a Facebook CDN URL
          const isFacebookUrl = post.image.includes('fbcdn.net') || post.image.includes('scontent.');
          const isCloudinaryUrl = post.image.includes('cloudinary.com') || post.image.includes('res.cloudinary.com');
          
          // Skip if already Cloudinary or not Facebook URL
          if (isCloudinaryUrl || !isFacebookUrl) {
            return post;
          }
          
          // Download and upload to Cloudinary
          console.log(`Auto-migrating Facebook URL to Cloudinary: ${post.image}`);
          const cloudinaryUrl = await downloadAndUploadImage(post.image, "company/social-posts");
          
          if (cloudinaryUrl) {
            needsUpdate = true;
            return {
              ...post,
              image: cloudinaryUrl
            };
          }
          
          // If upload failed, keep original
          return post;
        })
      );
      
      // Update database if any URLs were migrated
      if (needsUpdate) {
        console.log("Updating company with migrated Cloudinary URLs");
        company = await Company.findByIdAndUpdate(
          company._id,
          { $set: { socialPosts: updatedSocialPosts } },
          { new: true }
        );
      }
    }
    
    res.json({ success: true, data: company });
  } catch (error) {
    console.error("Error in getCompany:", error);
    // Return default company so frontend can still load (theme, nav) when DB is down or missing
    res.status(200).json({ success: true, data: defaultCompany() });
  }
};

// UPDATE company data
export const updateCompany = async (req, res) => {
  try {
    await connectDB();

    const updateData = {};

    // Handle text fields
    if (req.body.company !== undefined) updateData.company = req.body.company;
    if (req.body.slogan !== undefined) updateData.slogan = req.body.slogan;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.supportEmail !== undefined) updateData.supportEmail = req.body.supportEmail;
    if (req.body.address !== undefined) updateData.address = req.body.address;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.copyright !== undefined) updateData.copyright = req.body.copyright;
    if (req.body.authTagline !== undefined) updateData.authTagline = req.body.authTagline;

    // Handle social links (JSON string)
    if (req.body.socialLinks) {
      try {
        updateData.socialLinks = typeof req.body.socialLinks === 'string' 
          ? JSON.parse(req.body.socialLinks) 
          : req.body.socialLinks;
      } catch (e) {
        console.error("Error parsing socialLinks:", e);
      }
    }

    // Handle social posts (JSON string)
    if (req.body.socialPosts) {
      try {
        updateData.socialPosts = typeof req.body.socialPosts === 'string'
          ? JSON.parse(req.body.socialPosts)
          : req.body.socialPosts;
        console.log("Social Posts received:", JSON.stringify(updateData.socialPosts, null, 2));
      } catch (e) {
        console.error("Error parsing socialPosts:", e);
      }
    }

    // Handle brand theme (JSON string)
    if (req.body.brandTheme) {
      try {
        updateData.brandTheme = typeof req.body.brandTheme === 'string'
          ? JSON.parse(req.body.brandTheme)
          : req.body.brandTheme;
      } catch (e) {
        console.error("Error parsing brandTheme:", e);
      }
    }

    // Handle file uploads
    // With upload.any(), req.files is an array, not an object
    if (req.files && Array.isArray(req.files)) {
      console.log("Files received:", req.files.length, "files");
      console.log("File fieldnames:", req.files.map(f => f.fieldname));
      
      // Create a map of fieldname -> file for easier access
      const filesMap = {};
      req.files.forEach(file => {
        if (!filesMap[file.fieldname]) {
          filesMap[file.fieldname] = [];
        }
        filesMap[file.fieldname].push(file);
      });
      
      console.log("Files map keys:", Object.keys(filesMap));

      // Upload logo if provided (do not fail whole update if Cloudinary/env is misconfigured)
      if (filesMap.logo && filesMap.logo[0]) {
        try {
          const logoUrl = await uploadImage(filesMap.logo[0], "company");
          if (logoUrl) {
            updateData.logo = logoUrl;
          }
        } catch (e) {
          console.error("Company logo upload failed:", e?.message || e);
        }
      }

      // Upload favicon if provided
      if (filesMap.favicon && filesMap.favicon[0]) {
        try {
          const faviconUrl = await uploadImage(filesMap.favicon[0], "company");
          if (faviconUrl) {
            updateData.favicon = faviconUrl;
          }
        } catch (e) {
          console.error("Company favicon upload failed:", e?.message || e);
        }
      }

      // Handle social post images
      if (updateData.socialPosts && Array.isArray(updateData.socialPosts)) {
        // Get file indices if provided
        let fileIndices = [];
        if (req.body.socialPostFileIndices) {
          try {
            fileIndices = typeof req.body.socialPostFileIndices === 'string'
              ? JSON.parse(req.body.socialPostFileIndices)
              : req.body.socialPostFileIndices;
          } catch (e) {
            console.error("Error parsing socialPostFileIndices:", e);
          }
        }

        // Upload social post images from files
        console.log("File indices to process:", fileIndices);
        for (const index of fileIndices) {
          const fileKey = `socialPost_${index}`;
          console.log(`Processing social post ${index}, fileKey: ${fileKey}`);
          if (filesMap[fileKey] && filesMap[fileKey][0]) {
            console.log(`Uploading file for social post ${index}`);
            const imageUrl = await uploadImage(filesMap[fileKey][0], "company/social-posts");
            console.log(`Uploaded image URL for social post ${index}:`, imageUrl);
            if (imageUrl && updateData.socialPosts[index]) {
              updateData.socialPosts[index].image = imageUrl;
              console.log(`Updated social post ${index} with image URL:`, imageUrl);
            } else {
              console.warn(`Failed to update social post ${index}:`, { imageUrl, postExists: !!updateData.socialPosts[index] });
            }
          } else {
            console.warn(`No file found for social post ${index}, fileKey: ${fileKey}`);
          }
        }
        
        // Process URLs in social posts (download and upload to Cloudinary)
        console.log("Processing URLs in social posts...");
        for (let index = 0; index < updateData.socialPosts.length; index++) {
          const post = updateData.socialPosts[index];
          // Skip if already processed by file upload or if no image URL
          if (!post || !post.image || post.image.trim() === "") continue;
          
          // Skip if already a Cloudinary URL
          if (post.image.includes('cloudinary.com') || post.image.includes('res.cloudinary.com')) {
            console.log(`Post ${index}: Already a Cloudinary URL, skipping`);
            continue;
          }
          
          // Skip if it's a base64 data URL (should be handled by file upload)
          if (post.image.startsWith('data:')) {
            console.log(`Post ${index}: Base64 data URL, skipping (should be handled by file upload)`);
            continue;
          }
          
          // Skip if this index was in fileIndices (already processed)
          if (fileIndices.includes(index)) {
            console.log(`Post ${index}: Already processed via file upload, skipping URL download`);
            continue;
          }
          
          // Download and upload URL image
          console.log(`Post ${index}: Downloading and uploading image from URL: ${post.image}`);
          const cloudinaryUrl = await downloadAndUploadImage(post.image, "company/social-posts");
          if (cloudinaryUrl) {
            updateData.socialPosts[index].image = cloudinaryUrl;
            console.log(`Post ${index}: Successfully uploaded to Cloudinary: ${cloudinaryUrl}`);
          } else {
            console.warn(`Post ${index}: Failed to download/upload image from URL, keeping original URL`);
            // Keep the original URL if download/upload fails
            // This way the URL is still saved in database
            // Frontend will handle filtering if needed
            updateData.socialPosts[index].image = post.image;
          }
        }
        
        console.log("Final social posts after upload:", JSON.stringify(updateData.socialPosts, null, 2));
      }
    }

    // Find existing company or create new one
    let company = await Company.findOne();
    
    if (company) {
      // Update existing
      company = await Company.findByIdAndUpdate(
        company._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      company = await Company.create(updateData);
    }
    
    // Ensure we return the updated company with all processed URLs
    console.log("Returning company data with social posts:", company.socialPosts);

    res.json({ success: true, data: company });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
