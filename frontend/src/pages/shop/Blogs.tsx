import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";
import AtYourService from "@/components/ui/AtYourService";
import FeatureCards from "@/components/ui/FeatureCards";
import ProductCard from "@/components/products/ProductCard";
import { getBlogs, getBlogCategories, getBlogNiches } from "@/api/blog.api";
import { getProducts } from "@/api/product.api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageLoader from "@/components/ui/PageLoader";
import { getCompany } from "@/api/company.api";
import { spacing } from "@/utils/spacing";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";

interface Blog {
  _id: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  category: string | { _id: string; name: string };
  niche?: string | { _id: string; name: string };
  author: string | { _id: string; name: string; email: string; avatar?: string };
  status: string;
  createdAt: string;
  views?: number;
}

interface Category {
  _id: string;
  name: string;
  blogs: number;
}

interface Niche {
  _id: string;
  name: string;
  category: string | { _id: string; name: string };
  blogs: number;
}

export default function Blogs() {
  const landingNav = useSecondLandingNavbarProps();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNiche, setSelectedNiche] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(16);
  const [companyName, setCompanyName] = useState<string>("Grace by Anu");
  const [showProductScrollButtons, setShowProductScrollButtons] = useState(false);
  const nicheScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, selectedCategory, selectedNiche]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to load from cache first for faster initial render
      const cachedBlogs = getCachedData<Blog[]>(CACHE_KEYS.BLOGS);
      const cachedCategories = getCachedData<Category[]>(CACHE_KEYS.BLOG_CATEGORIES);
      const cachedNiches = getCachedData<Niche[]>(CACHE_KEYS.BLOG_NICHES);
      const cachedProducts = getCachedData<any[]>(CACHE_KEYS.PRODUCTS);
      const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);

      // Use cached data immediately if available
      if (cachedBlogs) {
        const publishedBlogs = cachedBlogs.filter((blog: Blog) => blog.status === "published");
        setBlogs(publishedBlogs);
        setFilteredBlogs(publishedBlogs);
      }
      if (cachedCategories) {
        setCategories(cachedCategories);
      }
      if (cachedNiches) {
        setNiches(cachedNiches);
      }
      if (cachedProducts) {
        setProducts(cachedProducts.slice(0, 4));
      }
      if (cachedCompany?.company) {
        setCompanyName(cachedCompany.company);
      }

      // Fetch fresh data in background and update cache
      const [blogsData, categoriesData, nichesData, productsData, companyData] = await Promise.all([
        getBlogs("published"),
        getBlogCategories(),
        getBlogNiches(),
        getProducts(),
        getCompany().catch(() => ({ company: "Grace by Anu" })),
      ]);

      // Filter only published blogs
      const publishedBlogs = blogsData.filter((blog: Blog) => blog.status === "published");
      setBlogs(publishedBlogs);
      setFilteredBlogs(publishedBlogs);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setNiches(Array.isArray(nichesData) ? nichesData : []);
      setProducts(Array.isArray(productsData) ? productsData.slice(0, 4) : []);
      
      if (companyData?.company) {
        setCompanyName(companyData.company);
      }

      // Cache the data (24 hours)
      setCachedData(CACHE_KEYS.BLOGS, publishedBlogs);
      setCachedData(CACHE_KEYS.BLOG_CATEGORIES, Array.isArray(categoriesData) ? categoriesData : []);
      setCachedData(CACHE_KEYS.BLOG_NICHES, Array.isArray(nichesData) ? nichesData : []);
      setCachedData(CACHE_KEYS.PRODUCTS, productsData || []);
      setCachedData(CACHE_KEYS.COMPANY, companyData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((blog) => {
        const categoryId = typeof blog.category === "object" ? blog.category._id : blog.category;
        return categoryId === selectedCategory;
      });
    }

    if (selectedNiche !== "all") {
      filtered = filtered.filter((blog) => {
        if (!blog.niche) return false;
        const nicheId = typeof blog.niche === "object" ? blog.niche._id : blog.niche;
        return nicheId === selectedNiche;
      });
    }

    setFilteredBlogs(filtered);
    setDisplayCount(16); // Reset display count when filter changes
  };

  const scrollNiches = (direction: "left" | "right") => {
    if (nicheScrollRef.current) {
      const scrollAmount = 200;
      nicheScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollProducts = (direction: "left" | "right") => {
    if (productsScrollRef.current) {
      const scrollAmount = 300;
      productsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

  const getBlogImage = (blog: Blog) => {
    if (blog.image && blog.image.trim() !== "" && blog.image !== "/product.png") {
      return blog.image.startsWith("http") ? blog.image : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${blog.image}`;
    }
    return "/product.png";
  };

  if (initialLoad && loading) {
    return <PageLoader />;
  }

  // Get niches for selected category
  const categoryNiches = selectedCategory !== "all" 
    ? niches.filter((niche) => {
        const categoryId = typeof niche.category === "object" ? niche.category._id : niche.category;
        return categoryId === selectedCategory;
      })
    : [];

  const displayedBlogs = filteredBlogs.slice(0, displayCount);
  const hasMore = filteredBlogs.length > displayCount;

  return (
    <div className="min-h-screen flex flex-col bg-transparent pt-20 landing-detail-page">
      <Navbar2
        bottomDivHasColor={false}
        otherPagesItems={landingNav.otherPagesItems}
        companyName={landingNav.companyName}
        hireMeHref={landingNav.hireMeHref}
        companySocialLinks={landingNav.companySocialLinks}
        mainNavLinks={landingNav.mainNavLinks}
      />
      <main className="flex-1 pt-0">
        {/* Header Section – same inner area as blog grid */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            <h1 className={`text-4xl md:text-5xl font-bold theme-heading text-center ${spacing.inner.gapBottom}`}>
              Blogs
            </h1>
            <p className={`text-lg text-gray-600 text-center ${spacing.inner.gapBottom}`}>
              Legal page details Sub Title
            </p>

            {/* Category Tabs */}
            <div className={`flex flex-wrap gap-2 justify-center ${spacing.inner.gapBottom}`}>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedNiche("all");
                }}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                  selectedCategory === "all"
                    ? "bg-[var(--theme-primary)] text-white scale-105 transform"
                    : "bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#F5E6D3)] text-gray-700 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_25%,#E8D4B8)] scale-100"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setSelectedNiche("all");
                  }}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                    selectedCategory === cat._id
                      ? "bg-[var(--theme-primary)] text-white scale-105 transform"
                      : "bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#F5E6D3)] text-gray-700 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_25%,#E8D4B8)] scale-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Horizontal Line – single thin line, inner area like blog grid */}
            <div className="w-full h-px bg-gray-300" style={{ margin: 0 }} aria-hidden />

            {/* Niches Scroll */}
          {selectedCategory !== "all" && categoryNiches.length > 0 && (
            <div className={`relative ${spacing.inner.gapTop} ${spacing.inner.gapBottom}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollNiches("left")}
                  className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors flex-shrink-0 z-10"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div
                  ref={nicheScrollRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <button
                    onClick={() => setSelectedNiche("all")}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ease-in-out ${
                      selectedNiche === "all"
                        ? "bg-[var(--theme-primary)] text-white scale-105 transform"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 scale-100"
                    }`}
                  >
                    All
                  </button>
                  {categoryNiches.map((niche) => (
                    <button
                      key={niche._id}
                      onClick={() => setSelectedNiche(niche._id)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ease-in-out ${
                        selectedNiche === niche._id
                          ? "bg-[var(--theme-primary)] text-white scale-105 transform"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 scale-100"
                      }`}
                    >
                      {niche.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => scrollNiches("right")}
                  className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors flex-shrink-0 z-10"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          )}
          </div>
        </section>

        {/* Blog Grid */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            {loading ? (
              <PageLoader />
            ) : displayedBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No blogs found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {displayedBlogs.map((blog) => (
                    <Link
                      key={blog._id}
                      to={`/blog/${blog._id}`}
                      state={{ blog }}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Blog Image */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                          <img
                            src={getBlogImage(blog)}
                            alt={blog.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/product.png";
                            }}
                          />
                        </div>
                        {/* Blog Info – tag first, then date in same row */}
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                            {blog.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {blog.niche && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {getNicheName(blog.niche)}
                              </span>
                            )}
                            {(blog.views ?? 0) > 0 && (
                              <span className="text-xs text-gray-500">{blog.views} view{(blog.views ?? 0) !== 1 ? "s" : ""}</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setDisplayCount(displayCount + 16)}
                      className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Feature Cards */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            <FeatureCards />
          </div>
        </section>

        {/* Popular Products */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
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
                      className="flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(25%-18px)]"
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
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer variant="landing2" />
      </section>
    </div>
  );
}
