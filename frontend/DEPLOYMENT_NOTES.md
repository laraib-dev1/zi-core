# Social Media Sharing - Deployment Notes

## Issue
After deployment, social media posts show empty (no image, no description).

## Solution Implemented
Created a Vercel serverless function at `frontend/api/product/[id].js` that:
1. Detects social media crawlers
2. Fetches product data from your API
3. Injects meta tags into the HTML
4. Returns HTML with meta tags for crawlers

## Deployment Steps

### 1. Set Environment Variables in Vercel
Go to your Vercel project settings and add:
- `VITE_API_URLS` = `http://localhost:3000/api,https://your-backend.vercel.app/api`
  - First URL is for local dev
  - Second URL is your deployed backend
- `VITE_API_URL` = `https://your-backend.vercel.app/api` (fallback)

### 2. Deploy
```bash
cd frontend
vercel deploy --prod
```

### 3. Test the Function
After deployment, test the function directly:
```
https://your-frontend.vercel.app/api/product/PRODUCT_ID
```

Add `?test=1` to see debug logs:
```
https://your-frontend.vercel.app/api/product/PRODUCT_ID?test=1
```

### 4. Test with Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://your-frontend.vercel.app/product/PRODUCT_ID`
3. Click "Scrape Again"
4. Check if image and description appear

### 5. Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Click on `api/product/[id]`
5. Check the logs for any errors

## Troubleshooting

### If meta tags still don't appear:

1. **Check Function Logs**
   - Look for errors in Vercel function logs
   - Check if API calls are failing
   - Verify environment variables are set

2. **Test API Endpoints**
   - Test: `https://your-backend.vercel.app/api/products/PRODUCT_ID`
   - Test: `https://your-backend.vercel.app/api/company`
   - Both should return JSON data

3. **Verify Image URLs**
   - Product images must be publicly accessible
   - Check if image URLs are absolute (start with http:// or https://)
   - Test image URL in browser directly

4. **Clear Facebook Cache**
   - Use Facebook Debugger to clear cache
   - Wait 24 hours for cache to expire naturally

5. **Check Function is Being Called**
   - Add `console.log` statements in the function
   - Check Vercel function logs after sharing a link

## Common Issues

### Issue: Function returns 404
**Solution**: Make sure `frontend/api/product/[id].js` exists and is committed to git

### Issue: API calls fail
**Solution**: 
- Check `VITE_API_URLS` environment variable is set correctly
- Verify backend is deployed and accessible
- Check CORS settings on backend

### Issue: Image URLs are relative
**Solution**: The function converts relative URLs to absolute, but make sure:
- Backend API returns full URLs for images
- Or function correctly prepends API URL

### Issue: Function not being called
**Solution**:
- Check `vercel.json` rewrite rules
- Verify the function file is in correct location
- Check Vercel deployment logs

## Manual Test

To manually test if the function works, simulate a crawler request:

```bash
curl -A "facebookexternalhit/1.1" https://your-frontend.vercel.app/product/PRODUCT_ID
```

This should return HTML with meta tags in the `<head>` section.









