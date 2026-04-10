import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SecondLanding from "./pages/shop/SecondLanding";
import ProjectDetail from "./pages/shop/ProjectDetail";
import ServiceDetail from "./pages/shop/ServiceDetail";
import CourseDetail from "./pages/shop/CourseDetail";
import { CartProvider } from "./components/products/CartContext";
import { AuthProvider } from "./hooks/useAuth";
import { LoaderProvider } from "./context/LoaderContext";
import PageLoader from "./components/ui/PageLoader";

// ---------- COMMENTED OUT FOR FUTURE USE: site pages ----------
// import Landing from "./pages/shop/Landing";
// import Shop from "./pages/shop/Shop";
// import ProductDetail from "./pages/shop/ProductDetail";
// import CartPage from "./pages/shop/CartPage";
// import PrivacyPolicy from "./pages/shop/PrivacyPolicy";
// import TermsConditions from "./pages/shop/TermsConditions";
// import FAQs from "./pages/shop/FAQs";
// import ContactUs from "./pages/shop/ContactUs";
// import AboutUs from "./pages/shop/AboutUs";
// import Blogs from "./pages/shop/Blogs";
// import BlogDetail from "./pages/shop/BlogDetail";
// import UserProfile from "./pages/user/UserProfile";
// import AdminCategories from "@/pages/admin/pages/CategoriesPage";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Access from "./pages/auth/Access";
// import Forgot from "./pages/auth/Forgot";

import Login from "./pages/auth/Login";
const Access = React.lazy(() => import("./pages/auth/Access"));
import AdminRoute from "./components/AdminRoute";
import { Navigate } from "react-router-dom";
import { getCompany } from "./api/company.api";
import { CACHE_KEYS, getCachedData, setCachedData } from "./utils/cache";
import { applyCompanyBranding, DEFAULT_COMPANY_NAME } from "./utils/companyBrand";
const AdminLayout = React.lazy(() => import("./pages/admin/layout/Adminlayout"));
const AdminProducts = React.lazy(() => import("./pages/admin/pages/ProductPage"));
const AdminSettings = React.lazy(() => import("./pages/admin/pages/SettingsPage"));
const AdminAssets = React.lazy(() => import("./pages/admin/pages/AssetsPage"));
const AdminDashboard = React.lazy(() => import("./pages/admin/pages/DashboardPage"));
const AdminOrders = React.lazy(() => import("./pages/admin/pages/OrdersPage"));
const AdminQueries = React.lazy(() => import("./pages/admin/pages/QueriesPage"));
const AdminReviews = React.lazy(() => import("./pages/admin/pages/ReviewsPage"));
const AdminBlogs = React.lazy(() => import("./pages/admin/pages/BlogPage"));
const CatalogPage = React.lazy(() => import("./pages/admin/pages/CatalogPage"));
const ApplicationsPage = React.lazy(() => import("./pages/admin/pages/ApplicationsPage"));
const SpConsolePage = React.lazy(() => import("./pages/admin/pages/SpConsolePage"));
const AdminSectionsPage = React.lazy(() => import("./pages/admin/pages/AdminSectionsPage"));
const AdminCategories = React.lazy(() => import("./pages/admin/pages/CategoriesPage"));
const OperatorsPage = React.lazy(() => import("./pages/admin/pages/OperatorsPage"));
const AdminNoPrivilegePage = React.lazy(() => import("./pages/admin/pages/AdminNoPrivilegePage"));
const DeveloperLayout = React.lazy(() => import("./pages/developer/layout/DeveloperLayout"));
const AdminTabsPage = React.lazy(() => import("./pages/developer/pages/AdminTabsPage"));
const CompanyPage = React.lazy(() => import("./pages/developer/pages/CompanyPage"));
const WebPagesPage = React.lazy(() => import("./pages/developer/pages/WebPagesPage"));
const ProfilePagesPage = React.lazy(() => import("./pages/developer/pages/ProfilePagesPage"));
const FooterPage = React.lazy(() => import("./pages/developer/pages/FooterPage"));
const SpComponentsPage = React.lazy(() => import("./pages/developer/pages/SpComponentsPage"));
const CatalogTypesPage = React.lazy(() => import("./pages/developer/pages/CatalogTypesPage"));
const LandingSectionsPage = React.lazy(() => import("./pages/developer/pages/LandingSectionsPage"));
const SpFolioPage = React.lazy(() => import("./pages/developer/pages/SpFolioPage"));
const LoaderSettingsPage = React.lazy(() => import("./pages/developer/pages/LoaderSettingsPage"));
const PortfolioPage = React.lazy(() => import("@/components/landing/PortfolioPage"));
const BlogPage = React.lazy(() => import("@/components/landing/BlogPage"));
const Blogs = React.lazy(() => import("@/pages/shop/Blogs"));
const CatalogDetail = React.lazy(() => import("@/pages/shop/CatalogDetail"));
const BlogCatalogDetail = React.lazy(() => import("@/pages/shop/BlogCatalogDetail"));
const ApplicationsListPage = React.lazy(() => import("@/pages/shop/ApplicationsListPage"));
const GetStartedPage = React.lazy(() => import("@/pages/shop/GetStartedPage"));

export default function App() {
  useEffect(() => {
    const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
    if (cachedCompany) {
      applyCompanyBranding(cachedCompany);
    } else {
      applyCompanyBranding({ company: DEFAULT_COMPANY_NAME });
    }

    const loadCompanyBranding = async () => {
      try {
        const company = await getCompany();
        setCachedData(CACHE_KEYS.COMPANY, company);
        applyCompanyBranding(company);
      } catch {
        // Ignore and keep current branding fallback
      }
    };
    loadCompanyBranding();
  }, []);

  return (
    <AuthProvider>
      <LoaderProvider>
      <CartProvider>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* New second landing with Navbar2 (other routes commented out for future use) */}
        <Route path="/" element={<SecondLanding />} />
         <Route path="/portfoliopage" element={<PortfolioPage />} />
        <Route path="/blogpage" element={<BlogPage />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/blog/:id" element={<BlogCatalogDetail />} />
        <Route path="/catalog/:type/:id" element={<CatalogDetail />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/zi-core-package" element={<GetStartedPage />} />
        <Route path="/get-started" element={<Navigate to="/zi-core-package" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access" element={<Access />} />
        <Route path="*" element={<SecondLanding />} />

        {/* ---------- COMMENTED OUT: SHOP ROUTES ---------- */}
        {/* <Route path="/" element={<Landing />} /> */}
        {/* <Route path="/shop" element={<Shop />} /> */}
        {/* <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} /> */}
        {/* <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} /> */}

        {/* ---------- COMMENTED OUT: OTHER AUTH ROUTES ---------- */}
        {/* <Route path="/access" element={<Access />} /> */}
        {/* <Route path="/forgot" element={<Forgot />} /> */}

        {/* ---------- COMMENTED OUT: CONTENT PAGES ---------- */}
        {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
        {/* <Route path="/terms-conditions" element={<TermsConditions />} /> */}
        {/* <Route path="/faqs" element={<FAQs />} /> */}
        {/* <Route path="/contact-us" element={<ContactUs />} /> */}
        {/* <Route path="/about-us" element={<AboutUs />} /> */}
        {/* <Route path="/blogs" element={<Blogs />} /> */}
        {/* <Route path="/blog/:id" element={<BlogDetail />} /> */}

        {/* ---------- COMMENTED OUT: USER PROFILE ---------- */}
        {/* <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} /> */}

        {/* ---------- ADMIN ROUTES ---------- */}
        <Route path="/admin" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminLayout /></Suspense></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="assets" element={<AdminAssets />} />
          <Route path="queries" element={<AdminQueries />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="blogs" element={<Navigate to="/admin/catalog/blog" replace />} />
          <Route path="catalog" element={<Navigate to="/admin/catalog/blog" replace />} />
          <Route path="catalog/:type" element={<CatalogPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="sections" element={<AdminSectionsPage />} />
          <Route path="operators" element={<OperatorsPage />} />
          <Route path="no-access" element={<AdminNoPrivilegePage />} />
          <Route path="sp-console" element={<SpConsolePage />} />
        </Route>

        {/* ---------- DEVELOPER ROUTES ---------- */}
        <Route path="/developer" element={<AdminRoute><Suspense fallback={<PageLoader />}><DeveloperLayout /></Suspense></AdminRoute>}>
          <Route index element={<Navigate to="/developer/admin-tabs" replace />} />
          <Route path="admin-tabs" element={<AdminTabsPage />} />
          <Route path="catalog-types" element={<CatalogTypesPage />} />
          <Route path="landing-sections" element={<LandingSectionsPage />} />
          <Route path="spfolio" element={<SpFolioPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="web-pages" element={<WebPagesPage />} />
          <Route path="profile-pages" element={<ProfilePagesPage />} />
          <Route path="footer" element={<FooterPage />} />
          <Route path="sp-components" element={<SpComponentsPage />} />
          <Route path="loader-settings" element={<LoaderSettingsPage />} />
        </Route>
      </Routes>
     </Suspense>
    </CartProvider>
    </LoaderProvider>
    </AuthProvider>
    
     
    
  );
}
