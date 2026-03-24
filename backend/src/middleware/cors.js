export default function corsMiddleware(req, res, next) {
  const allowedOrigins = process.env.FRONTEND_URLS
    .split(",")
    .map(url => url.trim().replace(/\/$/, "")); // sanitize URLs

  const origin = req.headers.origin;

  // REMOVE any previous header to avoid "multiple origin" error
  res.removeHeader("Access-Control-Allow-Origin");

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
}
