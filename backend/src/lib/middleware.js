import connectDB from "../config/db.js";

export const withDB = (handler) => async (req, res) => {
  try {
    // Connect to DB
    await connectDB();

    // Handle CORS
    const allowedOrigins = (process.env.FRONTEND_URLS || "").split(",").map(u => u.trim());
    const origin = req.headers.origin;
    res.setHeader(
      "Access-Control-Allow-Origin",
      allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") return res.status(200).end();

    return handler(req, res); // call actual handler
  } catch (err) {
    console.error("Middleware Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
