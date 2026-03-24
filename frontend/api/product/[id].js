// Vercel Serverless Function for Product Pages
// This function intercepts product page requests from social media crawlers
// and returns HTML with proper meta tags (including hero banner image)

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  
  // Detect if this is a social media crawler
  const isCrawler = 
    userAgent.includes('facebookexternalhit') ||
    userAgent.includes('Facebot') ||
    userAgent.includes('Twitterbot') ||
    userAgent.includes('LinkedInBot') ||
    userAgent.includes('WhatsApp') ||
    userAgent.includes('TelegramBot') ||
    userAgent.includes('Slackbot') ||
    userAgent.includes('SkypeUriPreview') ||
    userAgent.includes('Applebot') ||
    userAgent.includes('Googlebot') ||
    userAgent.includes('bingbot') ||
    userAgent.includes('YandexBot') ||
    userAgent.includes('DuckDuckBot') ||
    userAgent.includes('Baiduspider') ||
    userAgent.includes('Sogou') ||
    userAgent.includes('Exabot') ||
    userAgent.includes('ia_archiver');

  // If not a crawler, let Vercel handle it normally (serve React app)
  if (!isCrawler && !req.query.test) {
    return res.redirect(302, `/product/${id}`);
  }

  try {
    // Get API URL from environment variables
    const apiUrls = (process.env.VITE_API_URLS || '').split(',').map(url => url.trim()).filter(Boolean);
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    const API_URL = isProduction ? (apiUrls[1] || apiUrls[0] || process.env.VITE_API_URL) : apiUrls[0];
    
    if (!API_URL) {
      throw new Error('API URL not configured');
    }

    console.log(`🔍 Product handler called for ID: ${id}, Crawler: ${isCrawler ? 'YES' : 'NO'}`);
    console.log(`📡 API URL: ${API_URL}`);

    // Fetch product data
    const productRes = await fetch(`${API_URL}/products/${id}`);
    if (!productRes.ok) {
      throw new Error(`Product API returned ${productRes.status}`);
    }
    const productData = await productRes.json();
    const product = productData.data || productData;

    if (!product) {
      throw new Error('Product not found');
    }

    console.log(`✅ Product fetched: ${product.name}`);

    // Fetch hero banner
    let heroBannerImage = null;
    try {
      const bannerRes = await fetch(`${API_URL}/banners`);
      if (bannerRes.ok) {
        const bannerData = await bannerRes.json();
        const banners = bannerData.data || bannerData || [];
        const heroBanner = Array.isArray(banners) ? banners.find(b => b.slot === 'hero-main') : null;
        if (heroBanner && heroBanner.imageUrl) {
          heroBannerImage = heroBanner.imageUrl;
          console.log(`✅ Hero banner fetched: ${heroBannerImage}`);
        }
      }
    } catch (bannerErr) {
      console.warn('⚠️ Failed to fetch hero banner:', bannerErr.message);
    }

    // Fetch company name
    let companyName = 'Grace by Anu';
    try {
      const companyRes = await fetch(`${API_URL}/company`);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        companyName = companyData?.company || companyData?.data?.company || 'Grace by Anu';
      }
    } catch (companyErr) {
      console.warn('⚠️ Failed to fetch company name:', companyErr.message);
    }

    // Use hero banner image if available, otherwise use product image
    const productImages = [
      product.image1,
      product.image2,
      product.image3,
      product.image4,
      product.image5,
      product.image6,
    ].filter(Boolean);
    
    const imageToUse = heroBannerImage || productImages[0] || '/product.png';
    
    // Make image URL absolute if it's relative
    let ogImageUrl = imageToUse;
    if (ogImageUrl && !ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
      const baseUrl = API_URL.replace('/api', '');
      ogImageUrl = `${baseUrl}${ogImageUrl.startsWith('/') ? ogImageUrl : '/' + ogImageUrl}`;
    }

    // Clean description (remove HTML tags)
    let description = product.description || `${product.name} - Available at ${companyName}`;
    if (description) {
      // Remove HTML tags
      description = description.replace(/<[^>]*>/g, '');
      // Decode HTML entities
      description = description.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      // Trim and limit length
      description = description.trim().replace(/\s+/g, ' ');
      if (description.length > 200) {
        description = description.substring(0, 197) + '...';
      }
    }

    const pageUrl = `https://${req.headers.host}/product/${id}`;
    const pageTitle = `${product.name} | ${companyName}`;

    console.log(`📸 Using image: ${ogImageUrl}`);
    console.log(`📝 Description: ${description.substring(0, 50)}...`);

    // Generate HTML with meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${escapeHtml(product.name)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:secure_url" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(product.name)}" />
  <meta property="og:site_name" content="${escapeHtml(companyName)}" />
  <meta property="product:price:amount" content="${product.price || ''}" />
  <meta property="product:price:currency" content="PKR" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${pageUrl}" />
  <meta name="twitter:title" content="${escapeHtml(product.name)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <meta name="twitter:image:alt" content="${escapeHtml(product.name)}" />
  
  <!-- Additional -->
  <link rel="canonical" href="${pageUrl}" />
  
  <script>
    // Redirect regular browsers to the React app
    if (!navigator.userAgent.match(/(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|SkypeUriPreview|Applebot|Googlebot|bingbot|YandexBot|DuckDuckBot|Baiduspider|Sogou|Exabot|ia_archiver)/i)) {
      window.location.href = '/product/${id}';
    }
  </script>
</head>
<body>
  <h1>${escapeHtml(product.name)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${ogImageUrl}" alt="${escapeHtml(product.name)}" style="max-width: 100%; height: auto;" />
  <p><a href="/product/${id}">View Product</a></p>
</body>
</html>`;

    console.log('✅ Meta tags generated in HTML');

    // Set content type
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).send(html);

  } catch (error) {
    console.error('❌ Error in product handler:', error);
    
    // Return a basic HTML page with error info (for debugging)
    if (req.query.test) {
      return res.status(500).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Error</h1>
            <p>${escapeHtml(error.message)}</p>
            <pre>${escapeHtml(error.stack || '')}</pre>
          </body>
        </html>
      `);
    }
    
    // For crawlers, redirect to the product page (they'll get the React app)
    return res.redirect(302, `/product/${id}`);
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
