import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TableOfContents } from "@/components/ui/TableOfContents";
import ProductCard from "@/components/products/ProductCard";
import { getBlogById, getBlogCategories, getBlogs, incrementBlogView } from "@/api/blog.api";
import { getProducts } from "@/api/product.api";
import { getCompany } from "@/api/company.api";
import PageLoader from "@/components/ui/PageLoader";
import { Instagram, Youtube, ChevronLeft, ChevronRight } from "lucide-react";
import FeatureCards from "@/components/ui/FeatureCards";
import { spacing } from "@/utils/spacing";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import ShareOptions, { ShareOptionsSidebar } from "@/components/blog/ShareOptions";

interface Blog {
  _id: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  category: string | { _id: string; name: string };
  niche?: string | { _id: string; name: string };
  author: string | { _id: string; name: string; email: string; avatar?: string; bio?: string; socialLinks?: any };
  status: string;
  createdAt: string;
  views?: number;
}

interface Category {
  _id: string;
  name: string;
  blogs: number;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [companyName, setCompanyName] = useState<string>("Grace by Anu");
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [showProductScrollButtons, setShowProductScrollButtons] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const blogContentColumnRef = useRef<HTMLDivElement>(null);
  const sidebarColumnRef = useRef<HTMLDivElement>(null);
  const [sidebarFixed, setSidebarFixed] = useState<{ top: number; left: number; width: number; visible: boolean }>({
    top: 96,
    left: 0,
    width: 224,
    visible: true,
  });
  const NAV_TOP = 96;

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // If we navigated from Blogs page, use the passed blog immediately (no loader flash)
  useEffect(() => {
    const stateBlog = (location.state as any)?.blog as Blog | undefined;
    if (stateBlog && id && stateBlog._id === id) {
      setBlog(stateBlog);
      // allow page to render immediately; API fetch will still refresh in background
      setInitialLoad(false);
    }
  }, [id, location.state]);

  // Check if scroll buttons should be shown for popular products
  useEffect(() => {
    const checkProductScrollButtons = () => {
      if (!productsScrollRef.current) return;
      
      const container = productsScrollRef.current;
      const containerWidth = container.offsetWidth;
      const firstProduct = container.querySelector('[data-popular-product]') as HTMLElement;
      
      if (firstProduct) {
        const productWidth = firstProduct.offsetWidth;
        const gap = 24; // gap-6 = 24px
        const productsPerRow = Math.floor((containerWidth + gap) / (productWidth + gap));
        // Show scroll buttons when less than 4 products fit AND there's overflow
        setShowProductScrollButtons(productsPerRow < 4 && container.scrollWidth > container.clientWidth);
      }
    };

    if (products.length > 0) {
      setTimeout(checkProductScrollButtons, 100);
      window.addEventListener('resize', checkProductScrollButtons);
    }
    
    return () => {
      window.removeEventListener('resize', checkProductScrollButtons);
    };
  }, [products, loading]);

  // Fixed right sidebar: show until horizontal line reaches sidebar BOTTOM (Explore Topics), not column height
  useEffect(() => {
    const updateSidebarPosition = () => {
      if (!sidebarColumnRef.current || !blogContentColumnRef.current) return;
      const colRect = sidebarColumnRef.current.getBoundingClientRect();
      const blogBottom = blogContentColumnRef.current.getBoundingClientRect().bottom;
      const columnHeight = sidebarColumnRef.current.offsetHeight;
      // Use spacer (actual sidebar content) height, not column height – column is stretched to left column
      const spacerEl = sidebarColumnRef.current.querySelector("[data-sidebar-spacer]") as HTMLElement | null;
      const sidebarContentHeight = spacerEl?.offsetHeight ?? columnHeight;

      let top = Math.max(NAV_TOP, colRect.top);
      if (top + sidebarContentHeight > blogBottom) {
        top = Math.max(NAV_TOP, blogBottom - sidebarContentHeight);
      }
      const isLg = typeof window !== "undefined" && window.innerWidth >= 1024;
      // Hide only when horizontal line reaches sidebar BOTTOM (Explore Topics), not when line is near top
      const visible = isLg && colRect.width > 0 && blogBottom > NAV_TOP + sidebarContentHeight;

      setSidebarFixed({
        top,
        left: colRect.left,
        width: colRect.width,
        visible,
      });
    };

    const timer = setTimeout(updateSidebarPosition, 100);
    const timer2 = setTimeout(updateSidebarPosition, 400);
    window.addEventListener("scroll", updateSidebarPosition, { passive: true });
    window.addEventListener("resize", updateSidebarPosition);
    const ro = sidebarColumnRef.current ? new ResizeObserver(updateSidebarPosition) : null;
    if (ro && sidebarColumnRef.current) ro.observe(sidebarColumnRef.current);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("scroll", updateSidebarPosition);
      window.removeEventListener("resize", updateSidebarPosition);
      ro?.disconnect();
    };
  }, [blog, loading]);

  // Scroll functions for popular products row
  const scrollProducts = (direction: "left" | "right") => {
    if (!productsScrollRef.current) return;
    const scrollAmount = 300; // Scroll by 300px
    const currentScroll = productsScrollRef.current.scrollLeft;
    const newScroll = direction === "left" 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    productsScrollRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  const fetchData = async () => {
    try {
      // Try to load from cache first for faster initial render (before showing any loader)
      const cachedBlog = getCachedData<Blog>(`${CACHE_KEYS.BLOG_DETAIL}_${id}`);
      const cachedCategories = getCachedData<Category[]>(CACHE_KEYS.BLOG_CATEGORIES);
      const cachedProducts = getCachedData<any[]>(CACHE_KEYS.PRODUCTS);
      const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);

      // Use cached data immediately if available
      if (cachedBlog) {
        setBlog(cachedBlog);
        setInitialLoad(false);
      }
      if (cachedCategories) {
        setCategories(cachedCategories);
      }
      if (cachedProducts) {
        setProducts(cachedProducts.slice(0, 4));
      }
      if (cachedCompany) {
        setCompanyName(cachedCompany.company || "Grace by Anu");
        setCompanyLogo(cachedCompany.logo || "");
        setCompanyDescription(cachedCompany.description || "");
      }

      setLoading(true);
      // Fetch fresh data in background and update cache
      const [blogData, categoriesData, productsData, companyData] = await Promise.all([
        getBlogById(id!),
        getBlogCategories(),
        getProducts(),
        getCompany().catch(() => ({ company: "Grace by Anu", logo: "" })),
      ]);

      setBlog(blogData);
      if (id) incrementBlogView(id);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(Array.isArray(productsData) ? productsData.slice(0, 4) : []);
      
      if (companyData) {
        setCompanyName(companyData.company || "Grace by Anu");
        setCompanyLogo(companyData.logo || "");
        setCompanyDescription(companyData.description || "");
      }

      // Cache the data (24 hours)
      setCachedData(`${CACHE_KEYS.BLOG_DETAIL}_${id}`, blogData);
      setCachedData(CACHE_KEYS.BLOG_CATEGORIES, Array.isArray(categoriesData) ? categoriesData : []);
      setCachedData(CACHE_KEYS.PRODUCTS, productsData || []);
      setCachedData(CACHE_KEYS.COMPANY, companyData);
    } catch (err) {
      console.error("Failed to fetch blog:", err);
      // Try to use cached data as fallback
      const cachedBlog = getCachedData<Blog>(`${CACHE_KEYS.BLOG_DETAIL}_${id}`);
      if (cachedBlog) {
        setBlog(cachedBlog);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getCategoryName = (category: string | { _id: string; name: string }) => {
    return typeof category === "object" ? category.name : "";
  };

  const getNicheName = (niche?: string | { _id: string; name: string }) => {
    if (!niche) return "";
    return typeof niche === "object" ? niche.name : "";
  };

  const getAuthorName = (author: string | { _id: string; name: string; email: string; avatar?: string; bio?: string }) => {
    return typeof author === "object" ? author.name : "";
  };

  const getAuthorAvatar = (author: string | { _id: string; name: string; email: string; avatar?: string }) => {
    if (typeof author === "object" && author.avatar) {
      return author.avatar.startsWith("http") ? author.avatar : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${author.avatar}`;
    }
    return "";
  };

  const getAuthorBio = (author: string | { _id: string; name: string; email: string; avatar?: string; bio?: string }) => {
    return typeof author === "object" ? author.bio || "" : "";
  };

  const getAuthorSocialLinks = (author: string | { _id: string; name: string; email: string; avatar?: string; socialLinks?: any }) => {
    if (typeof author === "object" && author.socialLinks) {
      return {
        facebook: author.socialLinks.facebook || "",
        instagram: author.socialLinks.instagram || "",
        youtube: author.socialLinks.youtube || "",
        linkedin: author.socialLinks.linkedin || "",
        tiktok: author.socialLinks.tiktok || "",
        other: author.socialLinks.other || "",
      };
    }
    return {};
  };

  const getBlogImage = () => {
    if (blog?.image && blog.image.trim() !== "" && blog.image !== "/product.png") {
      return blog.image.startsWith("http") ? blog.image : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${blog.image}`;
    }
    return "/product.png";
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = blog?.title || "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  // Only show full page loader if we have zero blog data to render yet
  if (initialLoad && loading && !blog) {
    return <PageLoader />;
  }

  if (!blog) {
    return (
      <div className="bg-white">
        <Navbar />
        <div className={`text-center py-20 ${spacing.navbar.offset}`}>
          <p className="text-gray-600">Blog not found</p>
          <Link to="/blogs" className="text-[var(--theme-primary)] hover:underline mt-4 inline-block">
            Back to Blogs
          </Link>
        </div>
        <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Footer />
        </section>
      </div>
    );
  }

  const authorSocialLinks = getAuthorSocialLinks(blog.author);
  const categoryName = getCategoryName(blog.category);
  const nicheName = getNicheName(blog.niche);

  return (
    <div className="bg-white min-h-screen flex flex-col" data-toc-sticky-page style={{ overflow: "visible" }}>
      <style>{`
        /* Root + main overflow visible taake right sidebar sticky kaam kare */
        [data-toc-sticky-page],
        [data-toc-sticky-page] main {
          overflow: visible !important;
        }
        .content-area p[style*="text-align"],
        .content-area div[style*="text-align"],
        .content-area h1[style*="text-align"],
        .content-area h2[style*="text-align"],
        .content-area h3[style*="text-align"],
        .content-area h4[style*="text-align"],
        .content-area h5[style*="text-align"],
        .content-area h6[style*="text-align"],
        .content-area span[style*="text-align"],
        .content-area [style*="text-align"] {
          text-align: inherit !important;
        }
        .content-area [style*="text-align: center"],
        .content-area [style*="text-align:center"] {
          text-align: center !important;
        }
        .content-area [style*="text-align: right"],
        .content-area [style*="text-align:right"] {
          text-align: right !important;
        }
        .content-area [style*="text-align: justify"],
        .content-area [style*="text-align:justify"] {
          text-align: justify !important;
        }
        .content-area [style*="text-align: left"],
        .content-area [style*="text-align:left"] {
          text-align: left !important;
        }
      `}</style>
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1`}>
        {/* Header Section */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <h1 className="text-4xl md:text-5xl font-bold theme-heading text-center">
                Blog Details
              </h1>
              
              {/* Breadcrumb */}
              <div className="text-sm text-gray-600 text-center mt-4">
              <Link to="/blogs" className="hover:underline">Blogs</Link>
              {categoryName && (
                <>
                  {" / "}
                  <Link 
                    to={`/blogs?category=${encodeURIComponent(typeof blog.category === "object" ? blog.category._id : blog.category)}`} 
                    className="hover:underline"
                  >
                    {categoryName}
                  </Link>
                </>
              )}
              {nicheName && (
                <>
                  {" / "}
                  <Link 
                    to={`/blogs?category=${encodeURIComponent(typeof blog.category === "object" ? blog.category._id : blog.category)}&niche=${encodeURIComponent(typeof blog.niche === "object" ? blog.niche._id : blog.niche || "")}`} 
                    className="hover:underline"
                  >
                    {nicheName}
                  </Link>
                </>
              )}
              {" / "}
              <span className="text-gray-900">{blog.title}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content – blog (up to horizontal line) + right sidebar in one section so sidebar sticks only until blog ends */}
        <section className={`w-full ${spacing.section.gapTop}`} style={{ paddingBottom: 0 }}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                {/* Blog content – image to horizontal line only (sidebar sticks until here) */}
                <div ref={blogContentColumnRef} className="flex-1 min-w-0">
            {/* Blog Image */}
            {blog.image && (
              <div className="w-full mb-6 rounded-lg overflow-hidden">
                <img
                  src={getBlogImage()}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/product.png";
                  }}
                />
              </div>
            )}

            {/* Blog Title */}
            <h1 className={`text-3xl md:text-4xl font-bold theme-heading text-gray-900 ${spacing.inner.gapBottom}`}>
              {blog.title}
            </h1>

            {/* Author, Date, and Views */}
            <div className="flex items-center gap-4 mb-6 text-gray-600">
              <span>By {getAuthorName(blog.author)}</span>
              <span>•</span>
              <span>Date {formatDate(blog.createdAt)}</span>
              {(blog.views ?? 0) > 0 && (
                <>
                  <span>•</span>
                  <span>{blog.views} view{(blog.views ?? 0) !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>

            {/* Blog Content */}
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none text-gray-700 relative content-area"
              dangerouslySetInnerHTML={{ __html: blog.description || "<p>No content available.</p>" }}
            />

            {/* Horizontal Line – end of blog; right sidebar section ends here */}
            <div className="border-t border-gray-300 mt-8"></div>
              </div>

                {/* Right Sidebar – fixed via JS so it sticks with scroll until blog section ends */}
                <div ref={sidebarColumnRef} className="hidden lg:block lg:w-56 lg:shrink-0">
                  {/* Spacer: invisible copy so column keeps height; fixed clone below shows real content */}
                  <div data-sidebar-spacer className="space-y-4 opacity-0 pointer-events-none select-none" aria-hidden>
                    {blog.description && (
                      <TableOfContents htmlContent={blog.description} contentRef={contentRef} variant="sidebar" />
                    )}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Share Your Love!</h3>
                      <ShareOptions url={shareUrl} title={shareTitle} variant="sidebar" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{companyName}</h3>
                      {companyLogo && (
                        <img
                          src={companyLogo.startsWith("http") ? companyLogo : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${companyLogo}`}
                          alt={companyName}
                          className="w-full h-auto mb-3 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <p className="text-sm text-gray-600" style={{ marginBottom: 0 }}>
                        {companyDescription || `${companyName} - Your trusted source for quality products and insights.`}
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Explore More</h3>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <span key={cat._id} className="flex items-center justify-between gap-3 text-sm text-gray-700 px-2 py-1">
                            <span className="leading-5">{cat.name}</span>
                            <span className="text-xs text-gray-500">({cat.blogs || 0})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Fixed clone: visible sidebar that moves with scroll until section ends */}
                  {sidebarFixed.visible && (
                    <div
                      className="space-y-4 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
                      style={{
                        position: "fixed",
                        top: sidebarFixed.top,
                        left: sidebarFixed.left,
                        width: sidebarFixed.width,
                      }}
                    >
                      {blog.description && (
                        <TableOfContents htmlContent={blog.description} contentRef={contentRef} variant="sidebar" />
                      )}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Share Your Love!</h3>
                        <ShareOptions url={shareUrl} title={shareTitle} variant="sidebar" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{companyName}</h3>
                        {companyLogo && (
                          <img
                            src={companyLogo.startsWith("http") ? companyLogo : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${companyLogo}`}
                            alt={companyName}
                            className="w-full h-auto mb-3 rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-sm text-gray-600" style={{ marginBottom: 0 }}>
                          {companyDescription || `${companyName} - Your trusted source for quality products and insights.`}
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Explore More</h3>
                        <div className="space-y-2">
                          {categories.map((cat) => (
                            <Link
                              key={cat._id}
                              to={`/blogs?category=${cat._id}`}
                              className="flex items-center justify-between gap-3 text-sm text-gray-700 hover:text-[var(--theme-primary)] hover:underline transition-colors px-2 py-1 rounded"
                            >
                              <span className="leading-5">{cat.name}</span>
                              <span className="text-xs text-gray-500 whitespace-nowrap leading-5">({cat.blogs || 0})</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share below blog: icon row on small screens; inline circles on lg+ (sidebar shows card share on lg+) */}
              <div className={`${spacing.section.gap} mt-0`}>
                <h3 className={`text-lg font-semibold text-gray-900 ${spacing.inner.gapBottom}`}>Share Your Love!</h3>
                <div className="lg:hidden rounded-lg border border-gray-200 bg-white p-4">
                  <ShareOptions url={shareUrl} title={shareTitle} variant="sidebar" />
                </div>
                <div className="hidden lg:block">
                  <ShareOptions url={shareUrl} title={shareTitle} />
                </div>
              </div>

            {/* Author Profile - Commented out as requested, will use later */}
            {/* {typeof blog.author === "object" && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start gap-4">
                  {getAuthorAvatar(blog.author) && (
                    <img
                      src={getAuthorAvatar(blog.author)}
                      alt={getAuthorName(blog.author)}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/product.png";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{getAuthorName(blog.author)}</h4>
                    {getAuthorBio(blog.author) && (
                      <p className="text-sm text-gray-600 mb-3">{getAuthorBio(blog.author)}</p>
                    )}
                    {(authorSocialLinks.facebook || authorSocialLinks.instagram || authorSocialLinks.youtube || authorSocialLinks.linkedin) && (
                      <div className="flex gap-2">
                        {authorSocialLinks.facebook && (
                          <a
                            href={authorSocialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166FE5] transition-colors"
                          >
                            <Facebook size={14} />
                          </a>
                        )}
                        {authorSocialLinks.instagram && (
                          <a
                            href={authorSocialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                          >
                            <Instagram size={14} />
                          </a>
                        )}
                        {authorSocialLinks.youtube && (
                          <a
                            href={authorSocialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:bg-[#CC0000] transition-colors"
                          >
                            <Youtube size={14} />
                          </a>
                        )}
                        {authorSocialLinks.linkedin && (
                          <a
                            href={authorSocialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:bg-[#006399] transition-colors"
                          >
                            <Linkedin size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )} */}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <FeatureCards />
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>Popular Products</h2>
              {products.length > 0 && (
                <div className="relative">
                  {/* Horizontal Scrollable Popular Products Row */}
                  <div
                    ref={productsScrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {products.map((p) => (
                      <div
                        key={p._id}
                        data-popular-product
                        className="shrink-0 w-[calc(50%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(25%-18px)]"
                      >
                        <ProductCard
                          id={p._id}
                          name={p.name}
                          price={p.price}
                          image={p.image1 || "/product.png"}
                          offer={p.discount ? `${p.discount}% OFF` : undefined}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Left Scroll Button - Overlay on products with circular background */}
                  {showProductScrollButtons && (
                    <button
                      onClick={() => scrollProducts("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20 pointer-events-auto"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  )}

                  {/* Right Scroll Button - Overlay on products with circular background */}
                  {showProductScrollButtons && (
                    <button
                      onClick={() => scrollProducts("right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20 pointer-events-auto"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
    </div>
  );
}
