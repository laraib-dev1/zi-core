// pages/shop/Shop.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductGrid from "../../components/products/ProductGrid";
import Banner from "@/components/hero/Banner";
import DynamicButton from "@/components/ui/buttons/DynamicButton";
import AtYourService from "@/components/ui/AtYourService";
import FeatureCards from "@/components/ui/FeatureCards";
import { getProducts } from "@/api/product.api";
import { getBanners, type Banner as BannerType } from "@/api/banner.api";
import { getCategories } from "@/api/category.api";
import PageLoader from "@/components/ui/PageLoader";
import Pagination from "@/components/ui/Pagination";
import { ChevronDown, Check } from "lucide-react";
import { spacing } from "@/utils/spacing";

// API product type
interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  category?: { name: string };
  description?: string;
  currency?: string;
}

// Frontend Product type for display
interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  categoryName: string;
  description?: string;
  currency?: string;
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopBanner, setShopBanner] = useState<BannerType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Products per page: 20 products = 4 rows (5 products per row on large screen)
  const PRODUCTS_PER_PAGE = 20;

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category"); // category from query

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  
  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res: ApiProduct[] = await getProducts(); // API returns array

      // map API product to frontend Product type
   const mapped: Product[] = res.map((p) => ({
  id: p._id,
  name: p.name,
  price: p.price,
  discount: p.discount,
  image: [p.image1, p.image2, p.image3, p.image4, p.image5, p.image6].find(
  (img) => img && img.trim() !== "" && img !== "/product.png"
) || "/product.png",

  categoryName: p.category?.name || "Category",
  description: p.description,
  currency: p.currency,
}));

      // Store all products
      setAllProducts(mapped);

      if (selectedCategory) {
        // only show products of selected category
        setProducts(mapped.filter((p) => p.categoryName === selectedCategory));
      } else {
        // show all products
        setProducts(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Load banner that appears at the top of the Shop page
  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      const banner = data.find((b) => b.slot === "shop-main");
      setShopBanner(banner || null);
    } catch (err) {
      console.error("Failed to load banners for Shop page", err);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const displayedProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (initialLoad && loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1`}>
        {/* Shop banner */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            <Banner imageSrc={shopBanner?.imageUrl || "/hero.png"} />
          </div>
        </section>

        {/* Products Section */}
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${spacing.inner.gapBottom}`}>
            <h2 className="text-2xl font-bold theme-heading m-0 p-0">
              Products
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[180px]" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 flex items-center justify-between text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {selectedCategory 
                      ? categories.find(c => c.name === selectedCategory)?.name || "Select Category"
                      : `All (${allProducts.length})`
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        navigate("/shop");
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors ${
                        !selectedCategory ? 'bg-[var(--theme-primary)] text-white' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="text-left flex-1">All</span>
                        <span className={`text-xs whitespace-nowrap w-14 text-right ${!selectedCategory ? 'text-white' : 'text-gray-500'}`}>
                          ({allProducts.length})
                        </span>
                      </div>
                      {!selectedCategory && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                    </button>
                    
                    {categories.map((category) => {
                      const count = allProducts.filter(
                        (p) => p.categoryName === category.name
                      ).length;
                      const isSelected = selectedCategory === category.name;
                      return (
                        <button
                          key={category._id}
                          onClick={() => {
                            navigate(`/shop?category=${encodeURIComponent(category.name)}`);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors ${
                            isSelected ? 'bg-[var(--theme-primary)] text-white' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <span className="text-left flex-1">{category.name}</span>
                            <span className={`text-xs whitespace-nowrap w-14 text-right ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                              ({count})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && !initialLoad ? (
            <PageLoader />
          ) : (
            <>
              <ProductGrid items={displayedProducts} />
              
              {/* Pagination */}
              {products.length > PRODUCTS_PER_PAGE && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={products.length}
                  itemsPerPage={PRODUCTS_PER_PAGE}
                />
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
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
    </div>
  );
};

export default Shop;
