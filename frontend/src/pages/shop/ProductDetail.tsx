import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { addToWishlist, removeFromWishlist, getUserWishlist } from "@/api/user.api";
import { useToast } from "@/components/ui/toast";
import CircularLoader from "@/components/ui/CircularLoader";
import { spacing } from "@/utils/spacing";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import AddToCartButton from "@/components/ui/buttons/AddToCartButton";
import SocialShare from "@/components/products/SocialShare";
import ProductCard from "@/components/products/ProductCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cnTabsTriggerPill } from "@/components/ui/tabTriggerVariants";
import FeatureCards from "@/components/ui/FeatureCards";
import { getProduct, getProducts } from "@/api/product.api";
import { getCompany } from "@/api/company.api";
import { getBanners } from "@/api/banner.api";
import PageLoader from "@/components/ui/PageLoader";

/* =======================
   Types
======================= */
interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  images?: string[];
  category?: any;
  categoryName?: string;
  metaFeatures?: string;
  metaInfo?: string;
  video1?: string;
  video2?: string;
  stock?: number;
  [key: string]: any;
}

/* =======================
   Component
======================= */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [companyName, setCompanyName] = useState<string>("Grace by Anu");
  const [heroBannerImage, setHeroBannerImage] = useState<string | undefined>(undefined);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | undefined>(undefined);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const similarProductsScrollRef = useRef<HTMLDivElement>(null);

  /* =======================
     Fetch Single Product
  ======================= */
  useEffect(() => {
    if (!id) return;

    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);

        const images = [
          data.image1,
          data.image2,
          data.image3,
          data.image4,
          data.image5,
          data.image6,
        ].filter(img => 
          img && 
          img.trim() !== "" && 
          img !== "/product.png" && 
          !img.includes("placeholder") &&
          !img.includes("wqwwwq")
        );

        const categoryName = data.categoryName || data.category?.name || data.category || null;
        setProduct({
          ...data,
          images,
          categoryName: categoryName,
          category: data.category || null,
          name: data.name || "Product",
          metaFeatures: data.metaFeatures || "",
          metaInfo: data.metaInfo || "",
        });
      } catch (err) {
        console.error("PRODUCT FETCH ERROR:", err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* =======================
     Fetch Hero Banner for Social Share
  ======================= */
  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const banners = await getBanners();
        const heroBanner = banners.find((b) => b.slot === "hero-main");
        if (heroBanner && heroBanner.imageUrl) {
          setHeroBannerImage(heroBanner.imageUrl);
        }
      } catch (err) {
        console.error("Failed to fetch hero banner:", err);
      }
    };
    fetchHeroBanner();
  }, []);

  /* =======================
     Fetch All Products
  ======================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const products = await getProducts();
        const mapped = products.map((p: any) => ({
          ...p,
          images: [
            p.image1,
            p.image2,
            p.image3,
          ].filter(Boolean),
          categoryName: p.category?.name,
        }));
        setAllProducts(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  /* =======================
     Fetch Company Name and Logo
  ======================= */
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getCompany();
        if (data?.company) {
          setCompanyName(data.company);
        }
        if (data?.logo) {
          setCompanyLogoUrl(data.logo);
        }
      } catch (err) {
        console.error("Failed to load company:", err);
      }
    };

    fetchCompany();
  }, []);

  /* =======================
     Handle Broken Images and Remove Backgrounds in Meta Info
  ======================= */
  useEffect(() => {
    if (product) {
      // Wait for DOM to update, then handle broken images and backgrounds
      setTimeout(() => {
        const metaInfoDiv = document.querySelector('.meta-info-content');
        const metaFeaturesContainer = document.querySelector('.meta-features-container');
        
        // Remove backgrounds from all elements in meta info
        if (metaInfoDiv) {
          const allElements = metaInfoDiv.querySelectorAll('*');
          allElements.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = 'transparent';
            (el as HTMLElement).style.background = 'transparent';
            (el as HTMLElement).style.backgroundImage = 'none';
          });
          
          // Also handle broken images
          const images = metaInfoDiv.querySelectorAll('img');
          images.forEach((img) => {
            img.onerror = () => {
              img.style.display = 'none';
            };
            // Check if image is already broken
            if (!img.complete || img.naturalHeight === 0) {
              img.style.display = 'none';
            }
          });
        }
        
        // Remove backgrounds and set text color to black in meta features container
        if (metaFeaturesContainer) {
          const allElements = metaFeaturesContainer.querySelectorAll('*');
          allElements.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = 'transparent';
            (el as HTMLElement).style.background = 'transparent';
            (el as HTMLElement).style.backgroundImage = 'none';
            (el as HTMLElement).style.color = 'black';
          });
        }
      }, 100);
    }
  }, [product]);

  /* =======================
     Helper: Get Absolute Image URL
  ======================= */
  const getAbsoluteImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl || imageUrl === "/product.png" || imageUrl.trim() === "") {
      // Return absolute URL for default product image
      return `${window.location.origin}/product.png`;
    }
    
    // If already absolute URL (from API mapImages function), return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    
    // If relative URL, make it absolute using API URL
    const apiUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;
    if (imageUrl.startsWith("/")) {
      return `${apiUrl}${imageUrl}`;
    }
    
    // If relative path without leading slash
    return `${apiUrl}/${imageUrl}`;
  };

  /* =======================
     Helper: Clean Description for Meta Tags
  ======================= */
  const cleanDescription = (desc: string | undefined, productName: string): string => {
    if (!desc) return `${productName} - Available at ${companyName}`;
    
    // Remove HTML tags and decode HTML entities
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = desc;
    let text = tempDiv.textContent || tempDiv.innerText || "";
    
    // Trim and limit length (OG description should be max 200 chars)
    text = text.trim().replace(/\s+/g, " ");
    if (text.length > 200) {
      text = text.substring(0, 197) + "...";
    }
    
    return text || `${productName} - Available at ${companyName}`;
  };

  // Set meta tags in document head (must be before early return to follow Rules of Hooks)
  useEffect(() => {
    if (!product) return;

    // Use hero banner image for social sharing (priority), fallback to product image
    const imageToUse = heroBannerImage || product.images?.[0];
    const ogImageUrl = getAbsoluteImageUrl(imageToUse);
    const ogDescription = cleanDescription(product.description, product.name);
    const pageTitle = `${product.name} | ${companyName}`;

    console.log("🔍 Product Meta Tags Debug:", {
      productName: product.name,
      productDescription: product.description,
      cleanedDescription: ogDescription,
      productImages: product.images,
      firstImage: product.images?.[0],
      heroBannerImage: heroBannerImage,
      imageUsed: imageToUse,
      ogImageUrl: ogImageUrl,
      companyName: companyName,
      pageUrl: window.location.href,
    });

    // Set meta tags directly in document head as fallback for crawlers
    const setMetaTag = (property: string, content: string, isProperty = true) => {
      if (!content || content.trim() === "") {
        console.warn(`⚠️ Empty content for meta tag: ${property}`);
        return;
      }
      
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Verify image URL is accessible
    if (ogImageUrl) {
      const img = new Image();
      img.onload = () => console.log("✅ Product image is accessible:", ogImageUrl);
      img.onerror = () => console.error("❌ Product image failed to load:", ogImageUrl);
      img.src = ogImageUrl;
    }

    // Set all OG tags directly
    setMetaTag("og:title", product.name);
    setMetaTag("og:description", ogDescription);
    setMetaTag("og:image", ogImageUrl);
    setMetaTag("og:image:secure_url", ogImageUrl);
    setMetaTag("og:image:width", "1200");
    setMetaTag("og:image:height", "630");
    setMetaTag("og:image:alt", product.name);
    setMetaTag("og:url", window.location.href);
    setMetaTag("og:type", "product");
    setMetaTag("og:site_name", companyName);
    setMetaTag("product:price:amount", product.price.toString());
    setMetaTag("product:price:currency", "PKR");
    
    // Set Twitter tags
    setMetaTag("twitter:card", "summary_large_image", false);
    setMetaTag("twitter:title", product.name, false);
    setMetaTag("twitter:description", ogDescription, false);
    setMetaTag("twitter:image", ogImageUrl, false);
    setMetaTag("twitter:image:alt", product.name, false);
    
    // Set description
    setMetaTag("description", ogDescription, false);
    
    // Set title
    document.title = pageTitle;

    // Verify meta tags are set (for debugging)
    setTimeout(() => {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content");
      
      console.log("✅ Meta Tags Verification:", {
        ogTitle: ogTitle || "❌ MISSING",
        ogImage: ogImage || "❌ MISSING",
        ogDescription: ogDesc || "❌ MISSING",
        allMetaTags: Array.from(document.querySelectorAll("meta[property^='og:'], meta[name^='twitter:']")).map(m => ({
          attr: m.getAttribute("property") || m.getAttribute("name"),
          content: m.getAttribute("content")
        }))
      });

      if (!ogTitle || !ogImage || !ogDesc) {
        console.error("❌ CRITICAL: Some meta tags are missing! Social media crawlers won't see them.");
        console.error("💡 Solution: You need server-side rendering (SSR) or pre-rendering for social media sharing to work.");
      }
    }, 100);
  }, [product, companyName, heroBannerImage]);

  /* =======================
     Derived Data
  ======================= */
  const discountedPrice = product?.discount
    ? Math.round((product.price - (product.price * product.discount) / 100))
    : product?.price || 0;

  const similarProducts = product && allProducts.length > 0
    ? allProducts
        .filter((p) => p._id !== product._id)
        .slice(0, 4)
    : [];

  // Check if scroll buttons should be shown for similar products
  useEffect(() => {
    const checkScrollButtons = () => {
      if (!similarProductsScrollRef.current) return;
      
      const container = similarProductsScrollRef.current;
      const containerWidth = container.offsetWidth;
      const firstProduct = container.querySelector('[data-similar-product]') as HTMLElement;
      
      if (firstProduct) {
        const productWidth = firstProduct.offsetWidth;
        const gap = 24; // gap-6 = 24px
        const productsPerRow = Math.floor((containerWidth + gap) / (productWidth + gap));
        // Show scroll buttons when less than 4 products fit AND there's overflow
        setShowScrollButtons(productsPerRow < 4 && container.scrollWidth > container.clientWidth);
      }
    };

    if (similarProducts.length > 0) {
      // Delay to ensure DOM is ready
      setTimeout(checkScrollButtons, 100);
      window.addEventListener('resize', checkScrollButtons);
    }
    
    // Always return cleanup function
    return () => {
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [similarProducts, loading]);

  if (initialLoad && (loading || !product)) {
    return <PageLoader />;
  }

  if (!product) {
    return <PageLoader />;
  }

  // Scroll functions for similar products row
  const scrollSimilarProducts = (direction: "left" | "right") => {
    if (!similarProductsScrollRef.current) return;
    const scrollAmount = 300; // Scroll by 300px
    const currentScroll = similarProductsScrollRef.current.scrollLeft;
    const newScroll = direction === "left" 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    similarProductsScrollRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  // Calculate meta tags for Helmet (use hero banner if available, else product image)
  const imageForMeta = heroBannerImage || product?.images?.[0];
  const metaImageUrl = product ? getAbsoluteImageUrl(imageForMeta) : "";
  const metaDescription = product ? cleanDescription(product.description, product.name) : "";
  const metaTitle = product ? `${product.name} | ${companyName}` : companyName;

  // No need to parse - display as HTML like metaInfo

  // Clean HTML content to remove broken images and backgrounds
  const cleanHtmlContent = (html: string | undefined) => {
    if (!html) return "";
    // Remove img tags with empty src, invalid src, or placeholder text
    let cleaned = html
      .replace(/<img[^>]*src\s*=\s*["']?[^"'>]*["']?[^>]*>/gi, (match) => {
        // Check if image src contains placeholder indicators
        if (match.includes('wqwwwq') || match.includes('placeholder') || !match.match(/src\s*=\s*["']([^"']+)["']/)) {
          return '';
        }
        return match;
      })
      .replace(/<img[^>]*>/gi, (match) => {
        // Remove images without proper src
        if (!match.match(/src\s*=\s*["']([^"']+)["']/)) {
          return '';
        }
        return match;
      });
    
    // Remove background styles from all elements
    cleaned = cleaned.replace(/style\s*=\s*["'][^"']*background[^"']*["']/gi, (match) => {
      // Remove background-related styles
      const styleContent = match.match(/style\s*=\s*["']([^"']+)["']/)?.[1] || '';
      const cleanedStyle = styleContent
        .split(';')
        .filter(prop => !prop.trim().toLowerCase().includes('background'))
        .join(';');
      return cleanedStyle ? `style="${cleanedStyle}"` : '';
    });
    
    // Remove background-color specifically
    cleaned = cleaned.replace(/background-color\s*:\s*[^;]+;?/gi, '');
    cleaned = cleaned.replace(/background\s*:\s*[^;]+;?/gi, '');
    
    return cleaned;
  };

  // Wishlist Button Component
  const WishlistButtonComponent = ({ productId }: { productId: string }) => {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
      // Check if product is in wishlist
      const checkWishlistStatus = async () => {
        // Check both user and token to prevent unnecessary API calls
        const token = localStorage.getItem("token");
        if (!user || !token) {
          setIsInWishlist(false);
          return;
        }
        try {
          const wishlist = await getUserWishlist();
          const isInList = Array.isArray(wishlist) && wishlist.some((item: any) => 
            item._id === productId || item.product?._id === productId || item === productId
          );
          setIsInWishlist(isInList);
        } catch (err: any) {
          // Silently handle all errors - getUserWishlist already handles 401s
          setIsInWishlist(false);
        }
      };
      checkWishlistStatus();
    }, [productId, user]);

    const handleWishlistToggle = async () => {
      if (!user) {
        error("Please login to add items to wishlist");
        return;
      }

      if (wishlistLoading) return;

      setWishlistLoading(true);
      try {
        if (isInWishlist) {
          await removeFromWishlist(productId);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          setIsInWishlist(true);
          success("Added to wishlist");
        }
      } catch (err: any) {
        // Silently handle 401 errors (user not logged in) - already shown error message above
        if (err?.response?.status !== 401) {
          error(err.message || "Failed to update wishlist");
        }
      } finally {
        setWishlistLoading(false);
      }
    };

    // Show button for all users - will prompt login if not authenticated

    return (
      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className="flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: "var(--theme-primary)",
          color: "var(--theme-primary)",
          backgroundColor: isInWishlist ? "var(--theme-light)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!wishlistLoading) {
            e.currentTarget.style.backgroundColor = "var(--theme-light)";
          }
        }}
        onMouseLeave={(e) => {
          if (!wishlistLoading) {
            e.currentTarget.style.backgroundColor = isInWishlist ? "var(--theme-light)" : "transparent";
          }
        }}
      >
        {wishlistLoading ? (
          <CircularLoader 
            size={18} 
            color="var(--theme-primary)"
          />
        ) : (
          <Heart 
            size={20} 
            className={isInWishlist ? 'fill-current' : ''}
            style={{ 
              color: "var(--theme-primary)",
              fill: isInWishlist ? "var(--theme-primary)" : "transparent"
            }}
          />
        )}
      </button>
    );
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={product?.name || ""} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImageUrl} />
        <meta property="og:image:secure_url" content={metaImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={product?.name || ""} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={companyName} />
        <meta property="product:price:amount" content={product?.price?.toString() || ""} />
        <meta property="product:price:currency" content="PKR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.name || ""} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImageUrl} />
        <meta name="twitter:image:alt" content={product?.name || ""} />
        {/* Additional meta tags for better compatibility */}
        <meta name="og:image" content={metaImageUrl} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Navbar />
      <div className="bg-white min-h-screen flex flex-col">
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1`}>
        {/* Section 1: Product image + info */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-2 md:gap-3">
            {/* Image Gallery - Aligned left with space */}
            <div className="w-full flex justify-start -mr-2 md:-mr-3">
              <ProductImageGallery images={product.images || ["/product.png"]} />
            </div>

            {/* Product Info - Takes more space, fills the gap */}
            <div className="flex flex-col gap-3">
              <span 
                className="text-xs px-3 py-1 rounded-full w-fit text-white font-medium"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "white",
                }}
              >
                {product.categoryName || product.category?.name || (typeof product.category === 'string' ? product.category : 'Category')}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold theme-heading" style={{ color: "var(--theme-primary)" }}>{product.name || "Product Name"}</h1>

              <div className="flex gap-3 items-center flex-nowrap">
                <span className="text-xl sm:text-2xl font-bold whitespace-nowrap text-gray-900">
                  {discountedPrice} Rs
                </span>
                {product.discount && (
                  <span className="line-through text-gray-400 text-lg sm:text-xl whitespace-nowrap">
                    {product.price} Rs
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm sm:text-base">
                {product.description}
              </p>

              <div className="flex flex-row items-center gap-3 sm:gap-4">
                <AddToCartButton
                  product={{
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount,
                    image: product.images?.[0],
                  }}
                />
                <WishlistButtonComponent productId={product._id} />
              </div>

              {/* Social Share */}
              <SocialShare
                productName={product.name}
                productUrl={window.location.href}
                productImage={companyLogoUrl || heroBannerImage || product.images?.[0]}
                productDescription={product.description}
              />
            </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Description / Meta Features & Meta Info */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
          <Tabs defaultValue="description">
            <TabsList 
              className="bg-gray-100 p-1 rounded-lg h-auto relative"
              style={{ backgroundColor: "#F5F5F5" }}
            >
              <TabsTrigger value="description" className={cnTabsTriggerPill("rounded-md")}>
                Description
              </TabsTrigger>
              {(() => {
                // Only show video tab if video exists and is not empty
                const hasVideo = product.video1 && 
                  product.video1.trim() !== "" && 
                  product.video1.trim().length > 0;
                
                if (!hasVideo) return null;
                
                return (
                  <TabsTrigger value="videos" className={cnTabsTriggerPill("rounded-md")}>
                    Demo Video
                  </TabsTrigger>
                );
              })()}
            </TabsList>

            <TabsContent value="description" className="bg-transparent mt-4">
              {(() => {
                // Check if content exists and is not just empty HTML
                const hasMetaFeatures = product.metaFeatures && 
                  product.metaFeatures.trim() !== "" && 
                  product.metaFeatures.replace(/<[^>]*>/g, '').trim() !== "";
                const hasMetaInfo = product.metaInfo && 
                  product.metaInfo.trim() !== "" && 
                  product.metaInfo.replace(/<[^>]*>/g, '').trim() !== "";
                
                if (hasMetaFeatures || hasMetaInfo) {
                  return (
                    <div 
                      className="grid md:grid-cols-2 gap-6 rounded-xl p-6"
                      style={{ 
                        backgroundColor: "#FDFBF8",
                        border: "1px solid #E5E5E5"
                      }}
                    >
                      {hasMetaFeatures && (
                        <div className="bg-transparent meta-features-container">
                          <h3 className="text-2xl font-bold mb-6 theme-heading" style={{ color: "var(--theme-primary)" }}>Meta Features</h3>
                          <div
                            className="max-w-none meta-info-content text-black"
                            dangerouslySetInnerHTML={{
                              __html: cleanHtmlContent(product.metaFeatures),
                            }}
                          />
                        </div>
                      )}

                      {hasMetaInfo && (
                        <div className="bg-transparent meta-features-container">
                          <h3 className="text-2xl font-bold mb-6 theme-heading" style={{ color: "var(--theme-primary)" }}>Meta Info</h3>
                          <div
                            className="max-w-none meta-info-content text-black"
                            dangerouslySetInnerHTML={{
                              __html: cleanHtmlContent(product.metaInfo),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </TabsContent>

            {(() => {
              // Check if video exists and is not empty
              const hasVideo = product.video1 && 
                product.video1.trim() !== "" && 
                product.video1.trim().length > 0;
              
              if (!hasVideo) return null;
              
              return (
                <TabsContent value="videos" className="bg-transparent mt-4">
                  <div 
                    className="rounded-xl p-6"
                    style={{ 
                      backgroundColor: "#FDFBF8",
                      border: "1px solid #E5E5E5"
                    }}
                  >
                    <iframe
                      className="w-full h-80 rounded-lg"
                      src={product.video1?.replace(
                        "watch?v=",
                        "embed/"
                      ) || ""}
                      allowFullScreen
                    />
                  </div>
                </TabsContent>
              );
            })()}
          </Tabs>
            </div>
          </div>
        </section>

        {/* Section 3: Feature Cards */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              <FeatureCards />
            </div>
          </div>
        </section>

        {/* Similar Products Section */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              <h3 className="text-2xl font-bold theme-heading" style={{ color: "var(--theme-primary)" }}>
                Similar Products
              </h3>

              <div className={`relative ${spacing.inner.gapTop}`}>
                {/* Horizontal Scrollable Similar Products Row */}
                <div
                  ref={similarProductsScrollRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {similarProducts.map((p) => (
                    <div
                      key={p._id}
                      data-similar-product
                      className="flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(25%-18px)]"
                    >
                      <ProductCard
                        id={p._id}
                        name={p.name}
                        price={p.price}
                        image={p.images?.[0] || "/product.png"}
                        offer={p.discount ? `${p.discount}% OFF` : undefined}
                      />
                    </div>
                  ))}
                </div>

                {/* Left Scroll Button - Overlay on products with circular background */}
                {showScrollButtons && (
                  <button
                    onClick={() => scrollSimilarProducts("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20 pointer-events-auto"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}

                {/* Right Scroll Button - Overlay on products with circular background */}
                {showScrollButtons && (
                  <button
                    onClick={() => scrollSimilarProducts("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20 pointer-events-auto"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
      </div>
    </>
  );
}
