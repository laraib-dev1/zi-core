import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/hero/Hero";
import ProductGrid from "../../components/products/ProductGrid";
import ProductCard from "../../components/products/ProductCard";
import { ProductGridSkeleton } from "../../components/products/ProductGridSkeleton";
import Footer from "../../components/layout/Footer";
import CategorySection from "../../components/Categories/Categorysection";
import FeatureHero from "@/components/hero/FeatureHero";
import OfferSection from "@/components/hero/OfferSection";
import AtYourService from "@/components/ui/AtYourService";
import Hero2 from "@/components/hero/Hero2";
import FeatureSection from "@/components/hero/FeatureSection";
import ClientFeedback from "@/components/hero/ClientFeedback";
import DynamicButton from "@/components/ui/buttons/DynamicButton";
import PageLoader from "@/components/ui/PageLoader";
import { getProducts } from "@/api/product.api";
import { getBanners, type Banner } from "@/api/banner.api";
import { getCategories } from "@/api/category.api";
import { spacing } from "@/utils/spacing";
interface Product {
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
  category?: {
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
  icon?: string; // optional if you have
}

export default function () {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const productScrollRef = useRef<HTMLDivElement>(null);

  // Store all banners keyed by `slot` so we can use 3 different ones on this page.
  const [bannersBySlot, setBannersBySlot] = useState<Record<string, Banner>>({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBanners();
  }, []);

  // Load products for the landing page carousels / grids
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(); // fetch from backend
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Load categories for the category section
  const fetchCategories = async () => {
    try {
      const data = await getCategories(); // <-- API call
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load all banners once and index them by slot
  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      const map: Record<string, Banner> = {};
      data.forEach((b) => {
        map[b.slot] = b;
      });
      setBannersBySlot(map);
    } catch (err) {
      console.error("Failed to load banners for Landing page", err);
    }
  };

  // Check if scroll buttons should be shown (when less than 5 products fit in a row)
  useEffect(() => {
    const checkScrollButtons = () => {
      if (!productScrollRef.current) return;
      
      const container = productScrollRef.current;
      const containerWidth = container.offsetWidth;
      const firstProduct = container.querySelector('[data-product-card]') as HTMLElement;
      
      if (firstProduct) {
        const productWidth = firstProduct.offsetWidth;
        const gap = 24; // gap-6 = 24px
        const productsPerRow = Math.floor((containerWidth + gap) / (productWidth + gap));
        // Show scroll buttons when less than 5 products fit (responsive like second section)
        setShowScrollButtons(productsPerRow < 5 && container.scrollWidth > container.clientWidth);
      }
    };

    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [products, loading]);

  // Scroll functions for product row
  const scrollProducts = (direction: "left" | "right") => {
    if (!productScrollRef.current) return;
    const scrollAmount = 300; // Scroll by 300px
    const currentScroll = productScrollRef.current.scrollLeft;
    const newScroll = direction === "left" 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    productScrollRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  if (initialLoad) {
    return <PageLoader />;
  }

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden min-h-screen flex flex-col">

      <Navbar />
      <main className={`${spacing.navbar.offset} flex-1`}>
        {/* HERO #1: top background hero – no navbar bottom gap on landing */}
        <section>
          {bannersBySlot["hero-main"] ? (
            <Hero
              title="Welcome to our store"
              subtitle="Discover our latest collections."
              image={bannersBySlot["hero-main"].imageUrl}
              variant="full-background"
            />
          ) : (
            <Hero
              title="Welcome to our store"
              subtitle="This hero uses the image as full background"
              image="hero.png"
              variant="full-background"
            />
          )}
        </section>
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          {/* <h2 className="text-center text-gray-500 uppercase tracking-wide text-sm">Featured</h2> */}
          <div className={spacing.container.paddingXLarge}>
            {loading ? (
              <ProductGridSkeleton count={5} />
            ) : (
              <div className="relative">
                {/* Horizontal Scrollable Product Row - Responsive widths matching ProductGrid breakpoints */}
                <div
                  ref={productScrollRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {products.slice(0, 5).map((p) => (
                    <div
                      key={p._id}
                      data-product-card
                      className="flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-19.2px)]"
                    >
                      <ProductCard
                        id={p._id}
                        name={p.name}
                        price={p.price}
                        image={[p.image1, p.image2, p.image3, p.image4, p.image5, p.image6].find(
                          (img) => img && img.trim() !== ""
                        ) || "/product.png"}
                        offer={p.discount ? `${p.discount}% OFF` : undefined}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Left Scroll Button - Overlay on products with circular background */}
                {showScrollButtons && (
                  <button
                    onClick={() => scrollProducts("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20 pointer-events-auto"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                
                {/* Right Scroll Button - Overlay on products with circular background */}
                {showScrollButtons && (
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
        <CategorySection
            categories={categories.map(cat => ({
              title: cat.name,
              image: (cat.icon && cat.icon.trim() !== "") ? cat.icon : "/category.png"
            }))}
          />
        {/* HERO #3: FeatureHero image banner, uses 'hero-tertiary' if set - aligned with products */}
        <section className="p-0 m-0">
           <FeatureHero image={bannersBySlot["hero-tertiary"]?.imageUrl} />
        </section>

        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <div className={spacing.container.paddingXLarge}>
            {loading ? (
              <ProductGridSkeleton count={15} />
            ) : (
              <>
                <ProductGrid
                  items={products
                    .slice(0, 15) // Show 3 rows (15 products for desktop with 5 columns)
                    .map((p) => ({
                      id: p._id,
                      name: p.name,
                      price: p.price,
                      image: [
                        p.image1,
                        p.image2,
                        p.image3,
                        p.image4,
                        p.image5,
                        p.image6
                      ].filter(Boolean)[0] || "/product.png",
                      offer: p.discount ? `${p.discount}% OFF` : undefined
                    }))
                  }
                />
                <div className="flex justify-center mt-2 sm:mt-3">
                  <DynamicButton 
                    label="See All" 
                    variant="filled" 
                    shape="pill"
                    onClick={() => navigate("/shop")}
                  />
                </div>
              </>
            )}
          </div>
        </section>
        {/* Offer Section - Commented Out */}
        {/* <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <OfferSection />
        </section> */}
         {/* HERO #2: middle Hero2 section, uses 'hero-secondary' banner - aligned with products */}
         <section className={`${spacing.section.gap}`}>
           <Hero2
             title="Discover new scents"
             subtitle="A selection of fragrances to brighten your mood."
             image={bannersBySlot["hero-secondary"]?.imageUrl || "/hero.png"}
             imagePosition="right"
           />
         </section>
        <section className={`max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${spacing.section.gap}`}>
          <AtYourService />
        </section>
        {/* Banner at bottom of services section - Full width */}
        <section className={`w-full ${spacing.section.gap}`}>
          {bannersBySlot["hero-last"] ? (
            <Hero
              title="Discover your natural glow"
              subtitle="Pure essentials for body and mind."
              image={bannersBySlot["hero-last"].imageUrl}
              imagePosition="left"
            />
          ) : (
            <Hero
              title="Discover your natural glow"
              subtitle="Pure essentials for body and mind."
              image="/hero.png"
              imagePosition="left"
            />
          )}
        </section>
        <section className={`w-full ${spacing.section.gap}`}>
          <FeatureSection />
        </section>
        {/* Feedback Section - Full Width */}
        <section className={`w-full bg-white ${spacing.section.gap}`}>
          <ClientFeedback />
        </section>

      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
      
    </div>
  );
}
