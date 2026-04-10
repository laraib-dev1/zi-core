import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  ImageIcon,
  Bell,
  Settings,
  LogOut,
  Cog,
  Menu,
  MessageSquare,
  FileText,
  FolderTree,
  Star,
  Users,
  BarChart3,
  ChevronDown,
  LayoutList,
} from "lucide-react";
import { getMe } from "@/api/auth.api";
import { getEnabledAdminTabs } from "@/api/admintab.api";
import { getEnabledCatalogTypes } from "@/api/catalogtype.api";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import * as LucideIcons from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  adminAccess?: boolean;
  adminTabAccess?: string[];
  avatar?: string;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
}

const DEFAULT_MENU: MenuItem[] = [
  { label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
  { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { label: "Categories", icon: FolderTree, path: "/admin/categories" },
  { label: "Catalog", icon: FileText, path: "/admin/catalog" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Assets Panel", icon: ImageIcon, path: "/admin/assets" },
  { label: "Queries", icon: MessageSquare, path: "/admin/queries" },
  { label: "Reviews", icon: Star, path: "/admin/reviews" },
  { label: "Operators", icon: Users, path: "/admin/operators" },
  { label: "Sections", icon: LayoutList, path: "/admin/sections" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

function buildMenuFromTabs(tabs: any[]): MenuItem[] {
  if (!tabs?.length) return DEFAULT_MENU;
  const menuItems: MenuItem[] = tabs
    .filter((tab: any) => tab.path !== "/admin/sp-console")
    .map((tab: any) => {
      const IconComponent = (LucideIcons as any)[tab.icon] || LayoutDashboard;
      const path = tab.path === "/admin/blogs" ? "/admin/catalog" : tab.path;
      const label = tab.path === "/admin/blogs" ? "Catalog" : tab.label;
      return { label, icon: IconComponent, path };
    });
  return [...menuItems, { label: "Sections", icon: LayoutList, path: "/admin/sections" }];
}

function filterMenuForUser(menuItems: MenuItem[], currentUser: UserType | null): MenuItem[] {
  if (!currentUser) return menuItems;
  const isAdmin = currentUser.role?.toLowerCase() === "admin";
  if (isAdmin) return menuItems;
  if (!currentUser.adminAccess) return [];
  const allowed = new Set(currentUser.adminTabAccess || []);
  return menuItems.filter((item) => allowed.has(item.path));
}

export default function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const cached = getCachedData<any[]>(CACHE_KEYS.ADMIN_TABS);
    return cached ? buildMenuFromTabs(cached) : DEFAULT_MENU;
  });
  const [catalogTypes, setCatalogTypes] = useState<{ _id: string; slug: string; label: string }[]>(() => {
    const cached = getCachedData<{ _id: string; slug: string; label: string }[]>(CACHE_KEYS.CATALOG_TYPES);
    return Array.isArray(cached) ? cached : [];
  });
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const hasCachedTabs = !!getCachedData(CACHE_KEYS.ADMIN_TABS);
        const hasCachedTypes = !!getCachedData(CACHE_KEYS.CATALOG_TYPES);
        const useCacheForMenu = hasCachedTabs && hasCachedTypes;

        const userPromise = getMe(token).catch(() => null);
        const tabsPromise = useCacheForMenu ? Promise.resolve(null) : getEnabledAdminTabs().catch(() => null);
        const typesPromise = useCacheForMenu ? Promise.resolve(null) : getEnabledCatalogTypes().catch(() => []);

        const [userData, tabs, types] = await Promise.all([userPromise, tabsPromise, typesPromise]);

        if (!userData) {
          navigate("/login");
          return;
        }
          // Handle avatar URL - fix localhost URLs in production and handle Cloudinary URLs
          const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
          const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === "localhost" || 
            window.location.hostname === "127.0.0.1"
          );
          const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
          const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
          
          let avatarUrl = userData.user.avatar;
          if (avatarUrl) {
            // If it's a localhost URL (from development), replace with production API URL
            if (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1')) {
              const urlPath = avatarUrl.replace(/^https?:\/\/[^\/]+/, '');
              avatarUrl = `${apiBaseWithoutApi}${urlPath.startsWith('/') ? urlPath : '/' + urlPath}`;
            } else if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
              // Already a full URL (Cloudinary or production) - use directly
              avatarUrl = avatarUrl;
            } else {
              // Relative path - construct full URL
              avatarUrl = `${apiBaseWithoutApi}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
            }
          }
          
          const fullUser = {
            ...userData.user,
            avatar: avatarUrl || undefined
          };
        setUser(fullUser);
        const isAdmin = fullUser.role?.toLowerCase() === "admin";
        if (!isAdmin && !fullUser.adminAccess) {
          navigate("/login");
          return;
        }

        if (useCacheForMenu) {
          (async () => {
            const [freshTabs, freshTypes] = await Promise.all([
              getEnabledAdminTabs().catch(() => null),
              getEnabledCatalogTypes().catch(() => [])
            ]);
            if (Array.isArray(freshTypes)) {
              setCatalogTypes(freshTypes);
              setCachedData(CACHE_KEYS.CATALOG_TYPES, freshTypes);
            }
            if (freshTabs) {
              setMenu(filterMenuForUser(buildMenuFromTabs(freshTabs), fullUser));
              setCachedData(CACHE_KEYS.ADMIN_TABS, freshTabs);
            }
          })();
        } else {
          if (Array.isArray(types)) {
            setCatalogTypes(types);
            setCachedData(CACHE_KEYS.CATALOG_TYPES, types);
          }
          if (tabs) {
            setMenu(filterMenuForUser(buildMenuFromTabs(tabs), fullUser));
            setCachedData(CACHE_KEYS.ADMIN_TABS, tabs);
          }
        }
      } catch (err) {
        console.log(err);
        navigate("/login");
      } finally {
        setInitialLoading(false);
      }
    };

    loadAll();
  }, [navigate]);

  if (initialLoading) {
    return <PageLoader />;
  }

  const isSectionsPage = loc.pathname.startsWith("/admin/sections");
  const isAdminUser = user?.role?.toLowerCase() === "admin";
  const operatorTabPaths = new Set(user?.adminTabAccess || []);
  const showSpConsole = isAdminUser || operatorTabPaths.has("/admin/sp-console");

  // Sidebar content component (reusable for both desktop and mobile)
  // Sidebar content – same structure and styling as DeveloperLayout
  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Role badge: full admins see "Admin", panel operators see "Operator" */}
      <div className="px-5 pt-6 pb-6 border-b border-white/20 shrink-0">
        <span
          className="font-bold text-sm tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          {isAdminUser ? "Admin" : "Operator"}
        </span>
      </div>

      {/* MENU – Dashboard, Catalog (dropdown) & Settings; same link style as DeveloperLayout */}
      <nav className="flex flex-col gap-2 mt-6 px-2 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isCatalog = item.path === "/admin/catalog";
          const catalogActive = loc.pathname.startsWith("/admin/catalog");
          const active = isCatalog ? catalogActive : loc.pathname === item.path;

          if (isCatalog) {
            return (
              <div key={item.path}>
                <button
                  type="button"
                  onClick={() => setCatalogOpen((o) => !o)}
                  className={`flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-lg transition
                  ${active ? "text-white font-semibold shadow-md" : "hover:bg-white/10"}`}
                  style={{
                    backgroundColor: active ? "var(--theme-dark)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${catalogOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {catalogOpen && catalogTypes.length > 0 && (
                  <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-white/20 pl-3">
                    {catalogTypes.map((ct) => {
                      const typePath = `/admin/catalog/${ct.slug}`;
                      const typeActive = loc.pathname === typePath;
                      return (
                        <Link
                          key={ct._id}
                          to={typePath}
                          onClick={onLinkClick}
                          className={`block px-3 py-2 rounded-md text-sm transition
                          ${typeActive ? "text-white font-semibold" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                          style={{
                            backgroundColor: typeActive ? "var(--theme-dark)" : "transparent",
                          }}
                        >
                          {ct.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {catalogOpen && catalogTypes.length === 0 && (
                  <Link
                    to="/admin/catalog/blog"
                    onClick={onLinkClick}
                    className={`ml-4 mt-1 block px-4 py-2 rounded-md text-sm ${catalogActive ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}
                    style={{
                      backgroundColor: catalogActive ? "var(--theme-dark)" : "transparent",
                    }}
                  >
                    Blog
                  </Link>
                )}
              </div>
            );
          }

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

      {/* SP CONSOLE & LOGOUT (bottom – position and logic unchanged) */}
      <div className="mt-auto px-2 shrink-0 space-y-2">
        {showSpConsole && (
          <Link
            to="/admin/sp-console"
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition w-full
            ${loc.pathname === "/admin/sp-console" ? "text-white font-semibold shadow-md" : "hover:bg-white/10 text-white/80 hover:text-white"}`}
            style={{
              backgroundColor: loc.pathname === "/admin/sp-console" ? "var(--theme-dark)" : "transparent",
            }}
          >
            <Cog size={18} />
            Sp Console
          </Link>
        )}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
            if (onLinkClick) onLinkClick();
          }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 w-full text-white/80 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* ============ MOBILE DRAWER ============ */}
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
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
            background: `linear-gradient(to bottom, var(--theme-dark), var(--theme-primary))`,
          }}
        >
          <div className="flex flex-col h-full py-6">
            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ============ DESKTOP SIDEBAR – hidden on Sections page for full-width editor/preview ============ */}
      {!isSectionsPage && (
        <aside
          className="hidden lg:flex w-64 text-white flex-col shadow-lg fixed left-0 top-0 h-screen overflow-y-auto"
          style={{
            background: `linear-gradient(to bottom, var(--theme-dark), var(--theme-primary))`,
          }}
        >
          <SidebarContent />
        </aside>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main
        className={`flex-1 w-full pt-16 lg:pt-8 bg-gray-50 text-black ${
          isSectionsPage ? "lg:ml-0 p-0" : "lg:ml-64 p-4 lg:p-8"
        }`}
      >
        <React.Suspense fallback={<PageLoader />}>
          <div style={{ color: "#000000" }}>
            <Outlet />
          </div>
        </React.Suspense>
      </main>
    </div>
  );
}
