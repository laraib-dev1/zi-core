# Quick Fix for Social Media Sharing

## The Problem
Facebook/Twitter crawlers don't execute JavaScript, so they can't see client-side meta tags. The serverless function should inject meta tags, but it's not working.

## Immediate Test

### 1. Test if Function is Working
Run this command (replace YOUR_PRODUCT_ID):
```bash
curl -A "facebookexternalhit/1.1" https://your-frontend.vercel.app/api/product/YOUR_PRODUCT_ID | grep "og:image"
```

**Expected:** You should see `<meta property="og:image" content="https://...`

**If you see nothing:** The function isn't working or isn't deployed.

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Your Project → Functions → `api/product/[id]`
3. Look for logs when you test the curl command above

### 3. Verify Function File Exists
Make sure `frontend/api/product/[id].js` exists and is committed to git.

### 4. Redeploy
```bash
cd frontend
git add api/product/
git commit -m "Add serverless function for social sharing"
vercel deploy --prod
```

### 5. Test Again
After redeploy, test with curl command again.

### 6. Clear Facebook Cache
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your product URL
3. Click "Scrape Again"
4. Check "Raw Tags" - should show og:image and og:description

## If Still Not Working

Check these:
- ✅ Function file exists: `frontend/api/product/[id].js`
- ✅ File is committed to git
- ✅ Environment variable `VITE_API_URLS` is set in Vercel
- ✅ Backend API is accessible
- ✅ Product has images in database









