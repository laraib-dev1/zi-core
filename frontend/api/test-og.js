// Test endpoint to verify OG tags are working
// Visit: https://your-domain.vercel.app/api/test-og?id=PRODUCT_ID
export default async function handler(req, res) {
  const productId = req.query.id;
  
  if (!productId) {
    return res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Test OG Tags</title>
          <meta property="og:title" content="Test - No Product ID" />
          <meta property="og:description" content="Please provide ?id=PRODUCT_ID" />
        </head>
        <body>
          <h1>Test OG Tags</h1>
          <p>Add ?id=PRODUCT_ID to test</p>
        </body>
      </html>
    `);
  }
  
  // Fetch product (use production URL from env; Vercel sets VITE_API_URLS)
  const apiUrls = (process.env.VITE_API_URLS || '').split(',').map((u) => u.trim()).filter(Boolean);
  const apiUrl = apiUrls[1] || apiUrls[0] || process.env.VITE_API_URL || '';
  
  try {
    const response = await fetch(`${apiUrl}/products/${productId}`);
    const data = await response.json();
    const product = data.data || data;
    
    const images = [product.image1, product.image2, product.image3, product.image4, product.image5, product.image6].filter(Boolean);
    const ogImage = images[0] || '/product.png';
    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${apiUrl.replace('/api', '')}${ogImage}`;
    const ogDescription = product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 200) : `${product.name} - Available at Grace by Anu`;
    
    return res.send(`
      <!doctype html>
      <html>
        <head>
          <title>${product.name} | Grace by Anu</title>
          <meta property="og:title" content="${product.name}" />
          <meta property="og:description" content="${ogDescription}" />
          <meta property="og:image" content="${ogImageUrl}" />
          <meta property="og:image:secure_url" content="${ogImageUrl}" />
          <meta property="og:url" content="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.VITE_FRONTEND_URL || '')}/product/${productId}" />
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="Grace by Anu" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${product.name}" />
          <meta name="twitter:description" content="${ogDescription}" />
          <meta name="twitter:image" content="${ogImageUrl}" />
        </head>
        <body>
          <h1>${product.name}</h1>
          <p>${ogDescription}</p>
          <img src="${ogImageUrl}" alt="${product.name}" style="max-width: 500px;" />
          <p><strong>OG Image URL:</strong> ${ogImageUrl}</p>
          <p><strong>OG Description:</strong> ${ogDescription}</p>
        </body>
      </html>
    `);
  } catch (error) {
    return res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error fetching product</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
}









