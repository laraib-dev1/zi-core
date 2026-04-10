import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import cors from "cors";

import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import bannerRoutes from "./src/routes/banner.routes.js";
import contentRoutes from "./src/routes/content.routes.js";
import companyRoutes from "./src/routes/company.routes.js";
import footerRoutes from "./src/routes/footer.routes.js";
import admintabRoutes from "./src/routes/admintab.routes.js";
import webpageRoutes from "./src/routes/webpage.routes.js";
import profilepageRoutes from "./src/routes/profilepage.routes.js";
import queryRoutes from "./src/routes/query.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import blogRoutes from "./src/routes/blog.routes.js";
import catalogtypeRoutes from "./src/routes/catalogtype.routes.js";
import landingsectionRoutes from "./src/routes/landingsection.routes.js";
import banner2Routes from "./src/routes/banner2.routes.js";
import applicationRoutes from "./src/routes/application.routes.js";
import operatorRoutes from "./src/routes/operator.routes.js";

dotenv.config();

const app = express();

// CORS - must be before routes (FRONTEND_URLS = comma-separated from .env / Vercel)
const envOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);
const allowedOrigins = [
  ...envOrigins,
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.indexOf(origin) !== -1) return true;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) return true;
  if (origin.endsWith(".vercel.app") && (origin.startsWith("https://") || origin.startsWith("http://"))) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/admintabs", admintabRoutes);
app.use("/api/webpages", webpageRoutes);
app.use("/api/profilepages", profilepageRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/catalogtypes", catalogtypeRoutes);
app.use("/api/landingsections", landingsectionRoutes);
app.use("/api/banners2", banner2Routes);
app.use("/api/applications", applicationRoutes);
app.use("/api/operators", operatorRoutes);

// Health check for Vercel (helps debug and avoids cold-start 500 on first hit)
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, env: !!process.env.MONGO_URI });
});

// 404 - so every request gets a response (prevents function hang/crash)
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

// Global error handler - so uncaught errors return 500 instead of crashing the function
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Server error", message: err.message });
});

/** Run as long-running server when NOT on Vercel (local dev) */
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  try {
    await connectDB();
  } catch (error) {
    // Keep API alive in degraded mode so frontend doesn't get ECONNREFUSED.
    console.error("⚠️ MongoDB unavailable at startup. Running in degraded mode:", error.message);
  }
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

/** Set CORS headers on response so errors (500) sent from handler still have them */
function setCorsHeaders(req, res) {
  const origin = req.headers?.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  }
}

/** Default company when DB is unavailable (same shape as company.controller defaultCompany) */
const defaultCompanyPayload = () => ({
  success: true,
  data: {
    company: "",
    slogan: "",
    email: "",
    phone: "",
    supportEmail: "",
    address: "",
    logo: "",
    favicon: "",
    socialLinks: { facebook: "", tiktok: "", instagram: "", youtube: "", linkedin: "", other: "" },
    socialPosts: [],
    brandTheme: { primary: "#8C5934", accent: "", dark: "", light: "" },
    copyright: "",
    description: "",
    authTagline: "Handcrafted essentials with a touch of elegance.",
  },
});

/** Normalize and validate MongoDB URI. Strips quotes and accidental "MONGO_URI=" prefix. */
function getMongoUri() {
  let raw = process.env.MONGO_URI;
  if (raw == null || typeof raw !== "string") return null;
  let uri = raw.trim();
  if (uri.length === 0) return null;
  // If value was pasted as "MONGO_URI=mongodb+srv://...", use the part after =
  if (uri.startsWith("MONGO_URI=")) {
    uri = uri.slice(10).trim();
  }
  // Strip surrounding double or single quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  if (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) return uri;
  return null;
}

/** Vercel serverless: export a handler that connects DB then forwards to Express */
async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const isGetCompany = req.method === "GET" && (req.url === "/api/company" || req.url?.startsWith("/api/company?"));
  try {
    const mongoUri = getMongoUri();
    if (!mongoUri) {
      if (isGetCompany) {
        res.status(200).json(defaultCompanyPayload());
        return;
      }
      res.status(500).json({ error: "MONGO_URI is not set. In Vercel: Settings → Environment Variables → add MONGO_URI (exact name) with your full MongoDB URI." });
      return;
    }
    process.env.MONGO_URI = mongoUri;
    await connectDB();
    app(req, res);
  } catch (err) {
    console.error("Handler error:", err.message);
    if (!res.headersSent) {
      if (isGetCompany) {
        res.status(200).json(defaultCompanyPayload());
        return;
      }
      const msg = err.message || "Server error";
      const isMongoScheme = msg.includes("Invalid scheme") && msg.includes("mongodb");
      res.status(500).json({
        error: "Server error",
        message: isMongoScheme
          ? "MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'. Fix it in Vercel → Settings → Environment Variables."
          : msg,
      });
    }
  }
}

// On Vercel, only the exported handler runs; locally, start the server
if (!process.env.VERCEL) {
  startServer();
}

export default handler;
