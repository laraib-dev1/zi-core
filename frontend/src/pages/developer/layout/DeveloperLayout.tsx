import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FileText,
  PanelBottom,
  ArrowLeft,
  Menu,
  Package,
  FolderTree,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/PageLoader";
import { getCompany } from "@/api/company.api";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";

function companyAssetUrl(path: string): string {
  const p = (path || "").trim();
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const apiUrl = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "";
  return `${apiUrl.replace(/\/$/, "")}${p.startsWith("/") ? "" : "/"}${p}`;
}

export default function DeveloperLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tab icon: company favicon, else logo from Company page (same as public site branding)
  useEffect(() => {
    const apply = (c: { favicon?: string; logo?: string } | null | undefined) => {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      const fav = c?.favicon?.trim();
      const logo = c?.logo?.trim();
      if (fav) {
        link.href = companyAssetUrl(fav);
      } else if (logo) {
        link.href = companyAssetUrl(logo);
      } else {
        link.href = "/logo-removebg-preview.png";
      }
    };
    const cached = getCachedData<{ favicon?: string; logo?: string }>(CACHE_KEYS.COMPANY);
    if (cached) apply(cached);
    getCompany()
      .then((c) => apply(c))
      .catch(() => {});
  }, []);

  // Check developer authentication
  useEffect(() => {
    const developerAuth = localStorage.getItem("developerAuth");
    if (!developerAuth) {
      navigate("/admin/sp-console");
      return;
    }
  }, [navigate]);

  const menu = [
    { label: "Admin Tabs", icon: LayoutDashboard, path: "/developer/admin-tabs" },
    { label: "Catalog Types", icon: FolderTree, path: "/developer/catalog-types" },
    { label: "Loader settings", icon: Loader2, path: "/developer/loader-settings" },
    { label: "Company", icon: Building2, path: "/developer/company" },
    { label: "Web Pages", icon: FileText, path: "/developer/web-pages" },
    { label: "Profile Pages", icon: FileText, path: "/developer/profile-pages" },
    { label: "Footer", icon: PanelBottom, path: "/developer/footer" },
    // { label: "2nd Landing Sections", icon: LayoutList, path: "/developer/landing-sections" },
    { label: "SpFolio", icon: LayoutTemplate, path: "/developer/spfolio" },
    { label: "SP Components", icon: Package, path: "/developer/sp-components" },
  ];

  const handleBackToAdmin = () => {
    localStorage.removeItem("developerAuth");
    localStorage.removeItem("developerAuthTime");
    navigate("/admin/dashboard");
  };

  // Sidebar content component (reusable for both desktop and mobile)
  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Developer Badge */}
      <div className="px-5 pt-6 pb-6 border-b border-white/20 shrink-0">
        <span 
          className="font-bold text-sm tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          Developer
        </span>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2 mt-6 px-2 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = loc.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition
              ${active ? "text-white font-semibold shadow-md" : "hover:bg-white/10"}`}
              style={{
                backgroundColor: active ? "var(--theme-dark)" : "transparent",
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* BACK TO ADMIN BUTTON (bottom) */}
      <div className="mt-auto px-2 shrink-0">
        <button
          onClick={() => {
            handleBackToAdmin();
            if (onLinkClick) onLinkClick();
          }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 w-full text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* ============ MOBILE DRAWER ============ */}
      <div className="lg:hidden fixed top-4 left-4 z-100">
        <Button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="h-10 w-10 p-0 bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300 shadow-lg rounded-lg flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
      
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 text-white border-0 [&>button]:text-white [&>button]:hover:text-white [&>button]:hover:bg-white/10"
          style={{ 
            background: `linear-gradient(to bottom, var(--theme-dark), var(--theme-primary))`
          }}
        >
          <div className="flex flex-col h-full py-6">
            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside 
        className="hidden lg:flex w-64 text-white flex-col shadow-lg fixed left-0 top-0 h-screen overflow-y-auto"
        style={{ 
          background: `linear-gradient(to bottom, var(--theme-dark), var(--theme-primary))`
        }}
      >
        <SidebarContent />
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 w-full lg:ml-64 pt-16 lg:pt-8 p-4 lg:p-8 bg-gray-50 text-black">
        <React.Suspense fallback={<PageLoader />}>
          <div style={{ color: "#000000" }}>
            <Outlet />
          </div>
        </React.Suspense>
      </main>
    </div>
  );
}
