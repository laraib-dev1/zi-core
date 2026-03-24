# CRITICAL: Fix Social Media Sharing - Step by Step

## Current Status
✅ Client-side meta tags ARE working (you see them in console)
❌ Facebook crawler doesn't see them (doesn't execute JavaScript)
❌ Serverless function should fix this but might not be working

## IMMEDIATE ACTION REQUIRED

### Step 1: Verify Function is Deployed
Check if the function file exists in your Vercel deployment:
- File: `frontend/api/product/[id].js` ✅ (exists locally)
- Must be committed to git
- Must be deployed to Vercel

### Step 2: Test Function Directly
**THIS IS THE MOST IMPORTANT TEST:**

Open terminal and run (replace YOUR_PRODUCT_ID with actual ID):
```bash
curl -A "facebookexternalhit/1.1" https://your-frontend.vercel.app/api/product/YOUR_PRODUCT_ID
```

**What to look for:**
- Should return HTML
- Should contain `<meta property="og:image"` 
- Should contain `<meta property="og:description"`

**If you get 404 or error:** Function isn't deployed or route isn't working

### Step 3: Check Vercel Function Logs
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to "Functions" tab
4. Click on `api/product/[id]`
5. Check "Logs" tab
6. Run the curl command from Step 2
7. Look for logs like:
   - `🔍 Product handler called:`
   - `🤖 CRAWLER DETECTED`
   - `✅ Product fetched`

**If no logs appear:** Function isn't being called (routing issue)

### Step 4: Verify Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `VITE_API_URLS` = `http://localhost:3000/api,https://your-backend.vercel.app/api`

### Step 5: Redeploy
```bash
cd frontend
git add api/
git commit -m "Fix social sharing function"
git push
# Or
vercel deploy --prod
```

### Step 6: Test Again
After redeploy, run the curl command from Step 2 again.

### Step 7: Clear Facebook Cache
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://your-frontend.vercel.app/product/YOUR_PRODUCT_ID`
3. Click "Scrape Again"
4. Check "Raw Tags" section

## Expected Result

After all steps, when you share a product link:
- ✅ Product image appears in post
- ✅ Product description appears
- ✅ Product name as title
- ✅ Clicking opens product page

## If Still Not Working

Share these with me:
1. Output of curl command (Step 2)
2. Vercel function logs (Step 3)
3. Any errors you see









