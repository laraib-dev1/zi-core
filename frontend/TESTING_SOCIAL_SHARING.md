# Testing Social Media Sharing

## Quick Test Steps

### 1. Test the Function Directly
Test if the serverless function works:
```bash
curl -A "facebookexternalhit/1.1" https://your-frontend.vercel.app/api/product/YOUR_PRODUCT_ID | grep -i "og:image"
```

You should see: `<meta property="og:image" content="https://...`

### 2. Test with Test Endpoint
Visit in browser:
```
https://your-frontend.vercel.app/api/test-og?id=YOUR_PRODUCT_ID
```

This will show you:
- The product name
- The description
- The image
- The actual OG meta tags being generated

### 3. Test with Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://your-frontend.vercel.app/product/YOUR_PRODUCT_ID`
3. Click "Scrape Again"
4. Check the "Raw Tags" section

You should see:
- `og:title` = Product name
- `og:description` = Product description
- `og:image` = Product image URL

### 4. Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Your Project → Functions → `api/product/[id]`
3. Check logs for:
   - `🤖 CRAWLER DETECTED`
   - `✅ Product fetched`
   - `✅ Meta tags verified in HTML`

## Common Issues

### Issue: Function returns empty or error
**Check:**
- Environment variable `VITE_API_URLS` is set correctly
- Backend API is accessible: `https://your-backend.vercel.app/api/products/PRODUCT_ID`
- Product ID is valid

### Issue: Image not showing
**Check:**
- Image URL is absolute (starts with https://)
- Image is publicly accessible (test URL in browser)
- Image URL is from Cloudinary or your backend

### Issue: Description is empty
**Check:**
- Product has a description in the database
- Description is not just HTML tags

### Issue: Facebook still shows empty
**Solution:**
- Facebook caches responses for 24 hours
- Use Facebook Debugger to clear cache
- Wait 24 hours for natural expiration

## Expected Result

When you share a product link, the post should show:
- ✅ Product image (large preview)
- ✅ Product name as title
- ✅ Product description
- ✅ Site name "Grace by Anu"
- ✅ Clicking opens the product page









