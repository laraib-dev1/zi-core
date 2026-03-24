// Test endpoint to verify the function works
export default async function handler(req, res) {
  const testId = req.query.id || 'test';
  
  res.setHeader('Content-Type', 'application/json');
  return res.json({
    message: 'Function is working!',
    testId,
    userAgent: req.headers['user-agent'],
    env: {
      VERCEL: !!process.env.VERCEL,
      API_URL: process.env.VITE_API_URL || process.env.API_URL || 'not set',
      VITE_API_URLS: process.env.VITE_API_URLS || 'not set',
    }
  });
}









