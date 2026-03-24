# Debug Social Media Sharing

## Current Status
✅ Client-side meta tags ARE being set (visible in browser console)
❌ Facebook still shows empty post (crawlers don't execute JavaScript)

## The Problem
Social media crawlers (Facebook, Twitter, etc.) **do NOT execute JavaScript**. They only read the initial HTML. Your React app sets meta tags via JavaScript, which crawlers never see.

## Solution: Serverless Function
Created `frontend/api/product/[id].js` to inject meta tags server-side for crawlers.

## Debugging Steps

### 1. Verify Function is Deployed
Check if the function exists in Vercel:
- Go to Vercel Dashboard → Your Project → Functions
- Look for `api/product/[id]`
- If it's missing, the file might not be in the right location

### 2. Test Function Directly
Test the function with a crawler user-agent:
```bash
curl -A "facebookexternalhit/1.1" https://your-frontend.vercel.app/api/product/YOUR_PRODUCT_ID
```

Expected output: HTML with `<meta property="og:image">` tags in the `<head>`

### 3. Check Function Logs
In Vercel Dashboard → Functions → `api/product/[id]` → Logs
Look for:
- `🔍 Product handler called:` - confirms function is being called
- `✅ Product fetched:` - confirms API call succeeded
- `✅ Meta tags verified in HTML` - confirms meta tags were injected

### 4. Test API Endpoints
Verify your backend API is accessible:
```bash
# Test product endpoint
curl https://your-backend.vercel.app/api/products/YOUR_PRODUCT_ID

# Test company endpoint  
curl https://your-backend.vercel.app/api/company
```

Both should return JSON data.

### 5. Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `VITE_API_URLS` should be: `http://localhost:3000/api,https://your-backend.vercel.app/api`
- Or `VITE_API_URL` should be: `https://your-backend.vercel.app/api`

### 6. Test with Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://your-frontend.vercel.app/product/YOUR_PRODUCT_ID`
3. Click "Scrape Again"
4. Check the "Raw Tags" section - you should see `og:image` and `og:description`

### 7. Common Issues

#### Issue: Function returns 404
**Solution**: 
- Make sure `frontend/api/product/[id].js` exists
- File must be committed to git
- Redeploy after adding the file

#### Issue: Function logs show "Product not found"
**Solution**:
- Check API URL is correct in environment variables
- Verify product ID is valid
- Test API endpoint directly

#### Issue: Function logs show "Error fetching product"
**Solution**:
- Check backend is deployed and accessible
- Verify CORS settings allow Vercel function to call API
- Check API URL in environment variables

#### Issue: Meta tags appear in function response but Facebook still shows empty
**Solution**:
- Facebook caches responses for 24 hours
- Use Facebook Debugger to clear cache
- Wait 24 hours for natural cache expiration

## Quick Test

Run this to simulate Facebook's crawler:
```bash
curl -A "facebookexternalhit/1.1" \
  https://your-frontend.vercel.app/api/product/YOUR_PRODUCT_ID \
  | grep -i "og:image"
```

You should see: `<meta property="og:image" content="https://...`

If you don't see this, the function isn't working correctly.









