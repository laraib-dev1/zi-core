import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCompany } from "@/api/company.api";
import { getFooter } from "@/api/footer.api";
import { getCategories } from "@/api/category.api";
import { getProducts } from "@/api/product.api";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import LandingSocialIconButtons from "@/components/landing/LandingSocialIconButtons";
import { spacing } from "@/utils/spacing";
import { buildWhatsAppUrl } from "@/utils/companyBrand";

type FooterVariant = "default" | "landing2";

interface FooterLink {
  label: string;
  url: string;
  order: number;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
  order: number;
  enabled?: boolean;
}

export default function Footer({ variant = "default" }: { variant?: FooterVariant }) {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState({
    company: "VERES",
    copyright: "",
    description: "",
    phone: "",
    socialPosts: [] as Array<{ image: string; url: string; order: number }>,
    socialLinks: {} as Record<string, string>,
  });
  const [footerData, setFooterData] = useState<{
    sections: FooterSection[];
    copyright: string;
    showCategories: boolean;
    showProducts: boolean;
    showSocialIcons: boolean;
    showSocialLinks: boolean;
  }>({
    sections: [],
    copyright: "",
    showCategories: false,
    showProducts: false,
    showSocialIcons: false,
    showSocialLinks: false,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from cache first for faster initial render
        const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
        const cachedFooter = getCachedData<any>(CACHE_KEYS.FOOTER);
        const cachedCategories = getCachedData<any[]>(CACHE_KEYS.CATEGORIES);
        const cachedProducts = getCachedData<any[]>(CACHE_KEYS.PRODUCTS);

        // Use cached data immediately if available
        if (cachedCompany) {
          setCompanyData({
            company: cachedCompany.company || "VERES",
            copyright: cachedCompany.copyright || "",
            description: cachedCompany.description || "",
            phone: cachedCompany.phone || "",
            socialPosts: (cachedCompany.socialPosts || [])
              .filter((post: any) => post && post.image && post.image.trim() !== "")
              .slice(0, 8),
            socialLinks: cachedCompany.socialLinks || {},
          });
        }
        if (cachedFooter) {
          setFooterData({
            sections: (cachedFooter.sections || []).filter((s: FooterSection) => s.enabled !== false).sort((a: FooterSection, b: FooterSection) => a.order - b.order),
            copyright: cachedFooter.copyright || `© ${new Date().getFullYear()} ${cachedCompany?.company || "VERES"}. All rights reserved.`,
            showCategories: cachedFooter.showCategories === true || cachedFooter.showCategories === "true" || cachedFooter.showCategories === 1,
            showProducts: cachedFooter.showProducts === true || cachedFooter.showProducts === "true" || cachedFooter.showProducts === 1,
            showSocialIcons: cachedFooter.showSocialIcons === true || cachedFooter.showSocialIcons === "true" || cachedFooter.showSocialIcons === 1,
            showSocialLinks: cachedFooter.showSocialLinks === true || cachedFooter.showSocialLinks === "true" || cachedFooter.showSocialLinks === 1,
          });
        }
        if (cachedCategories) {
          setCategories(cachedCategories);
        }
        if (cachedProducts) {
          setProducts(cachedProducts);
        }

        // Fetch fresh data in background and update cache
        const [companyData, footerData, categoriesData, productsData] = await Promise.all([
          getCompany(),
          getFooter().catch(() => ({ sections: [], copyright: "" })),
          getCategories().catch(() => []),
          getProducts().catch(() => []),
        ]);

        const company = companyData;
        const footer = footerData;

        // Cache the data (24 hours)
        setCachedData(CACHE_KEYS.COMPANY, company);
        setCachedData(CACHE_KEYS.FOOTER, footer);
        setCachedData(CACHE_KEYS.CATEGORIES, categoriesData || []);
        setCachedData(CACHE_KEYS.PRODUCTS, productsData || []);
        
        // Process social posts - ensure they have valid images
        // Helper to get full image URL
        const getImageUrl = (imageUrl: string): string => {
          if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === "") {
            return "";
          }
          
          const trimmed = imageUrl.trim();
          
          // If it's a base64 data URL, return as is (shouldn't happen after upload, but handle it)
          if (trimmed.startsWith('data:')) {
            return "";
          }
          
          // Exclude Facebook CDN URLs (they give 403 errors due to hotlink protection)
          const imageLower = trimmed.toLowerCase();
          if (imageLower.includes('fbcdn.net') || 
              imageLower.includes('scontent.') ||
              (imageLower.includes('facebook.com') && imageLower.includes('scontent'))) {
            return ""; // Return empty string to filter out
          }
          
          // If it's already a full URL (Cloudinary or http/https), return as is
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
          }
          
          // If it's a relative path, construct full URL
          const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
          const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === "localhost" || 
            window.location.hostname === "127.0.0.1"
          );
          const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
          const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
          
          if (trimmed.startsWith('/')) {
            return `${apiBaseWithoutApi}${trimmed}`;
          }
          
          return `${apiBaseWithoutApi}/${trimmed}`;
        };
        
        const validSocialPosts = (company.socialPosts || [])
          .filter((post: any) => {
            if (!post || !post.image || typeof post.image !== 'string' || post.image.trim() === "") {
              return false;
            }
            
            // Exclude base64 (should be uploaded by now)
            if (post.image.startsWith('data:')) {
              return false;
            }
            
            // Exclude Facebook CDN URLs (they give 403 errors due to hotlink protection)
            const imageLower = post.image.toLowerCase();
            if (imageLower.includes('fbcdn.net') || 
                imageLower.includes('scontent.') ||
                (imageLower.includes('facebook.com') && imageLower.includes('scontent'))) {
              console.warn("Filtering out Facebook CDN URL (403 error):", post.image);
              return false;
            }
            
            return true;
          })
          .map((post: any) => {
            const imageUrl = getImageUrl(post.image);
            return {
              image: imageUrl,
              url: post.url || "#",
              order: post.order || 0
            };
          })
          .filter((post: any) => post.image !== "") // Remove posts with invalid URLs
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .slice(0, 8);
        
        console.log("Social Posts loaded:", {
          total: (company.socialPosts || []).length,
          valid: validSocialPosts.length,
          posts: validSocialPosts,
          rawPosts: company.socialPosts
        }); // Debug log
        
        // Double check - filter out any Facebook URLs that might have slipped through
        const finalValidPosts = validSocialPosts.filter((post: any) => {
          if (!post || !post.image) return false;
          const imageLower = post.image.toLowerCase();
          return !imageLower.includes('fbcdn.net') && 
                 !imageLower.includes('scontent.') &&
                 !(imageLower.includes('facebook.com') && imageLower.includes('scontent'));
        });
        
        console.log("Final filtered social posts:", {
          before: validSocialPosts.length,
          after: finalValidPosts.length,
          filtered: validSocialPosts.length - finalValidPosts.length
        });
        
        setCompanyData({
          company: company.company || "VERES",
          copyright: company.copyright || "",
          description: company.description || "",
          phone: company.phone || "",
          socialPosts: finalValidPosts,
          socialLinks: company.socialLinks || {},
        });

        // Use copyright from company first, then footer, then default
        const copyrightText = company.copyright || footer.copyright || `© ${new Date().getFullYear()} ${company.company || "VERES"}. All rights reserved.`;
        
        // Debug: Log footer data to see what we're getting
        console.log("Footer data from API:", footer);
        console.log("showCategories:", footer.showCategories, typeof footer.showCategories);
        console.log("showProducts:", footer.showProducts, typeof footer.showProducts);
        console.log("showSocialIcons:", footer.showSocialIcons, typeof footer.showSocialIcons);
        console.log("showSocialLinks:", footer.showSocialLinks, typeof footer.showSocialLinks);
        
        setFooterData({
          sections: (footer.sections || []).filter((s: FooterSection) => s.enabled !== false).sort((a: FooterSection, b: FooterSection) => a.order - b.order),
          copyright: copyrightText,
          showCategories: footer.showCategories === true || footer.showCategories === "true" || footer.showCategories === 1,
          showProducts: footer.showProducts === true || footer.showProducts === "true" || footer.showProducts === 1,
          showSocialIcons: footer.showSocialIcons === true || footer.showSocialIcons === "true" || footer.showSocialIcons === 1,
          showSocialLinks: footer.showSocialLinks === true || footer.showSocialLinks === "true" || footer.showSocialLinks === 1,
        });
        setCategories(categoriesData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error("Failed to load footer data", err);
        // Try to use cached data as fallback
        const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
        const cachedFooter = getCachedData<any>(CACHE_KEYS.FOOTER);
        if (cachedCompany) {
          setCompanyData({
            company: cachedCompany.company || "VERES",
            copyright: cachedCompany.copyright || "",
            description: cachedCompany.description || "",
            phone: cachedCompany.phone || "",
            socialPosts: (cachedCompany.socialPosts || [])
              .filter((post: any) => post && post.image && post.image.trim() !== "")
              .slice(0, 8),
            socialLinks: cachedCompany.socialLinks || {},
          });
        }
        if (cachedFooter) {
          setFooterData({
            sections: (cachedFooter.sections || []).filter((s: FooterSection) => s.enabled !== false).sort((a: FooterSection, b: FooterSection) => a.order - b.order),
            copyright: cachedFooter.copyright || `© ${new Date().getFullYear()} ${cachedCompany?.company || "VERES"}. All rights reserved.`,
            showCategories: cachedFooter.showCategories === true || cachedFooter.showCategories === "true" || cachedFooter.showCategories === 1,
            showProducts: cachedFooter.showProducts === true || cachedFooter.showProducts === "true" || cachedFooter.showProducts === 1,
            showSocialIcons: cachedFooter.showSocialIcons === true || cachedFooter.showSocialIcons === "true" || cachedFooter.showSocialIcons === 1,
            showSocialLinks: cachedFooter.showSocialLinks === true || cachedFooter.showSocialLinks === "true" || cachedFooter.showSocialLinks === 1,
          });
        }
      }
    };
    loadData();
  }, []);

  const handleLinkClick = (url: string) => {
    if (!url || url === "#") return;
    
    // Check if it's an external URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank");
    } else {
      // Internal route
      navigate(url);
    }
  };

  const enabledSections = footerData.sections.filter(s => s.enabled !== false);
  const companySocialLinks = companyData.socialLinks || {};
  const footerSocialLinks = {
    twitter: companySocialLinks.twitter || companySocialLinks.x || "",
    facebook: companySocialLinks.facebook || "",
    linkedin: companySocialLinks.linkedin || "",
    instagram: companySocialLinks.instagram || "",
  };
  const hasAnyFooterSocialLink = Object.values(footerSocialLinks).some((v) => String(v || "").trim() !== "");
  const hasFooterColumns =
    (footerData.showCategories && categories.length > 0) ||
    (footerData.showProducts && products.length > 0) ||
    enabledSections.length > 0 ||
    (footerData.showSocialLinks && hasAnyFooterSocialLink);

  return (
    <footer className="text-gray-300" style={{ backgroundColor: "var(--theme-dark, #6B4A2C)" }}>
      {/* <div className={`max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ${spacing.section.gapTop} ${spacing.section.gapBottomLarge}`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8 sm:gap-10 lg:gap-20"> */}
          {/* Left side - Logo and Footer Sections */}
          {/* <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-6 sm:gap-8 lg:gap-20 lg:justify-center"> */}
            {/* Logo */}
            {/* <div className="flex flex-col items-center text-center space-y-4 lg:min-w-[160px]">
              <span className="text-white font-serif text-2xl lg:text-3xl font-semibold">{companyData.company}</span> */}
              {/* Social Icons - 2nd landing style: white icons on circular beige backgrounds */}
              {/* {(variant === "landing2" || footerData.showSocialIcons) && (
                <div className="flex gap-2 sm:gap-3 mt-2 justify-center"> */}
                  {/* {[
                    { href: companyData.socialLinks?.twitter || companyData.socialLinks?.x || "#", Icon: XIcon, label: "X" },
                    { href: companyData.socialLinks?.facebook || "#", Icon: Facebook, label: "Facebook" },
                    { href: companyData.socialLinks?.instagram || "#", Icon: Instagram, label: "Instagram" },
                    { href: companyData.socialLinks?.skype || "#", Icon: FaSkype, label: "Skype" },
                    { href: companyData.socialLinks?.linkedin || "#", Icon: Linkedin, label: "LinkedIn" },
                  ].filter(({ href }) => href && href !== "#").map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      {...(href && href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={label}
                      className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div> */}

            {/* Categories Column - if enabled */}
            {/* {footerData.showCategories && categories.length > 0 && (
              <div className="flex flex-col text-base lg:min-w-[140px]">
                <h3 className="text-white font-semibold text-lg">Categories</h3>
                <div className="flex flex-col space-y-3 lg:space-y-4 mt-3 lg:mt-4">
                  {categories.slice(0, 3).map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop?category=${encodeURIComponent(category.name)}`}
                      className="text-gray-300 hover:underline"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )} */}

            {/* Products Column - if enabled */}
            {/* {footerData.showProducts && products.length > 0 && (
              <div className="flex flex-col text-base lg:min-w-[140px]">
                <h3 className="text-white font-semibold text-lg">Products</h3>
                <div className="flex flex-col space-y-3 lg:space-y-4 mt-3 lg:mt-4">
                  {products.slice(0, 3).map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="text-gray-300 hover:underline"
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              </div>
            )} */}

            {/* Footer Sections from SP Panel */}
            {/* {enabledSections.map((section, index) => (
              <div key={index} className="flex flex-col text-base lg:min-w-[140px]">
                <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                <div className="flex flex-col space-y-3 lg:space-y-4 mt-3 lg:mt-4">
                  {section.links.map((link, linkIndex) => (
                    <button
                      key={linkIndex}
                      onClick={() => handleLinkClick(link.url)}
                      className="text-left text-gray-300 hover:underline"
                      style={{ cursor: "pointer" }}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))} */}

            {/* Social Links Column - if enabled */}
            {/* {footerData.showSocialLinks && companyData.socialLinks && (
              <div className="flex flex-col text-base lg:min-w-[140px]">
                <h3 className="text-white font-semibold text-lg">Follow Us</h3>
                <div className="flex flex-col space-y-3 lg:space-y-4 mt-3 lg:mt-4">
                  {companyData.socialLinks.facebook && (
                    <a href={companyData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                      Facebook
                    </a>
                  )}
                  {companyData.socialLinks.instagram && (
                    <a href={companyData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                      Instagram
                    </a>
                  )} */}
                  {/* {companyData.socialLinks.linkedin && (
                    <a href={companyData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {companyData.socialLinks.youtube && (
                    <a href={companyData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div> */}

          {/* Right side - Social Posts Gallery - only show if there are posts - Large screens only */}
          {/* {companyData.socialPosts && companyData.socialPosts.length > 0 && (
            <div className="hidden lg:block lg:ml-auto lg:shrink-0">
              <div className="grid grid-cols-4 gap-2 lg:gap-3 w-72 lg:w-96">
                {companyData.socialPosts
                  .filter((post: any) => {
                    if (!post || !post.image) return false;
                    const imageLower = post.image.toLowerCase();
                    return !imageLower.includes('fbcdn.net') && 
                           !imageLower.includes('scontent.') &&
                           !(imageLower.includes('facebook.com') && imageLower.includes('scontent'));
                  })
                  .slice(0, 8)
                  .map((post, index) => (
                    <a
                      key={index}
                      href={post.url || "#"}
                      target={post.url && post.url !== "#" ? "_blank" : undefined}
                      rel={post.url && post.url !== "#" ? "noopener noreferrer" : undefined}
                      className="w-full aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity bg-gray-700"
                    >
                      <img
                        src={post.image}
                        alt={`Social post ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div> */}
        
        {/* Small screens - Social Posts Gallery - Show after all columns */}
        {/* {companyData.socialPosts && companyData.socialPosts.length > 0 && (
          <div className="lg:hidden w-full mt-6">
            <div className="grid grid-cols-4 gap-2">
              {companyData.socialPosts
                .filter((post: any) => {
                  if (!post || !post.image) return false;
                  const imageLower = post.image.toLowerCase();
                  return !imageLower.includes('fbcdn.net') && 
                         !imageLower.includes('scontent.') &&
                         !(imageLower.includes('facebook.com') && imageLower.includes('scontent'));
                })
                .slice(0, 8)
                .map((post, index) => (
                  <a
                    key={index}
                    href={post.url || "#"}
                    target={post.url && post.url !== "#" ? "_blank" : undefined}
                    rel={post.url && post.url !== "#" ? "noopener noreferrer" : undefined}
                    className="w-full aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity bg-gray-700"
                  >
                    <img
                      src={post.image}
                      alt={`Social post ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </a>
                ))}
            </div>
          </div>
        )} */}

        {/* Bottom bar */}
        {/* <div className={`${spacing.margin.top} border-t border-gray-600 ${spacing.section.gapTop} ${spacing.section.gapBottom} flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-3`}> */}
          {/* <span className="text-center md:text-left">{footerData.copyright || `© ${new Date().getFullYear()} ${companyData.company}. All rights reserved.`}</span> */}
          {/* <div className="flex gap-3 sm:gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
          // </div> */}
          {/* </div> */}

      {/* </div> */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className={hasFooterColumns ? "lg:col-span-1" : "lg:col-span-4 text-center"}>
            <h2 className="text-2xl font-semibold text-white">{companyData.company || "VERES"}</h2>
            <p className={`text-gray-100 text-sm mt-3 ${hasFooterColumns ? "max-w-xl" : "max-w-xl mx-auto"}`}>
              {companyData.description || "We are updating our premium products with real-time support and a dedicated consultant."}
            </p>
            {footerData.showSocialIcons && hasAnyFooterSocialLink && (
              <LandingSocialIconButtons
                links={footerSocialLinks}
                useDefaults={false}
                className={hasFooterColumns ? "mt-6 justify-start" : "mt-6 justify-center"}
              />
            )}
          </div>

          {footerData.showCategories && categories.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 3).map((category) => (
                  <Link
                    key={category._id}
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="block text-gray-100 hover:underline"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {footerData.showProducts && products.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Products</h3>
              <div className="space-y-2">
                {products.slice(0, 3).map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="block text-gray-100 hover:underline"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {enabledSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold text-lg mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <button
                    key={linkIndex}
                    onClick={() => handleLinkClick(link.url)}
                    className="block text-left text-gray-100 hover:underline"
                    style={{ cursor: "pointer" }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {footerData.showSocialLinks && hasAnyFooterSocialLink && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Follow Us</h3>
              <div className="space-y-2">
                {footerSocialLinks.facebook ? (
                  <a href={footerSocialLinks.facebook} target="_blank" rel="noopener noreferrer" className="block text-gray-100 hover:underline">Facebook</a>
                ) : null}
                {footerSocialLinks.twitter ? (
                  <a href={footerSocialLinks.twitter} target="_blank" rel="noopener noreferrer" className="block text-gray-100 hover:underline">Twitter</a>
                ) : null}
                {footerSocialLinks.linkedin ? (
                  <a href={footerSocialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="block text-gray-100 hover:underline">LinkedIn</a>
                ) : null}
                {footerSocialLinks.instagram ? (
                  <a href={footerSocialLinks.instagram} target="_blank" rel="noopener noreferrer" className="block text-gray-100 hover:underline">Instagram</a>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-100 gap-2">
          <span className="text-center md:text-left">
            {companyData.copyright?.trim() ||
              footerData.copyright?.trim() ||
              `© ${new Date().getFullYear()} ${companyData.company || "VERES"}. All rights reserved.`}
          </span>
          <a
            href={buildWhatsAppUrl(
              companyData.phone,
              "Hello, I visited the ZI_Core site. I would like to ask you"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:opacity-90 cursor-pointer underline-offset-2 hover:underline"
          >
            Join {companyData.company || "Company"}
          </a>
        </div>
      </div>
    </footer>
  );
}
