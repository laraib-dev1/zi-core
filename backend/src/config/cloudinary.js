// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {{ resource_type?: string }} [options] — use `resource_type: "raw"` for .exe, .apk, zips, etc.
 */
export const uploadToCloudinary = (buffer, folder, options = {}) => {
  const { resource_type = "image", ...uploadOpts } = options;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type, ...uploadOpts },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
