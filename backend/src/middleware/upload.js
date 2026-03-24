// backend/src/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Detect if running on Vercel serverless
const isVercel = !!process.env.VERCEL;

// LOCAL STORAGE (disk) → works on your PC
let storage;

if (!isVercel) {
  console.log("📌 Using DISK storage (local development)");

  const uploadsPath = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });
}

// VERCEL STORAGE (memory)
else {
  console.log("⚡ Using MEMORY storage (Vercel serverless)");
  storage = multer.memoryStorage();
}

// Only allow images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const upload = uploadMultiple;
