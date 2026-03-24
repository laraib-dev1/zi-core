import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/buttons/Button";
import { AppSidebar } from "../app-sidebar";
import { useTheme } from "@/lib/ThemeProvider";
import { useCart } from "../products/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Menu, ShoppingCart, LogOut, User } from "lucide-react";
import { getCompany } from "@/api/company.api";
import { getMe } from "@/api/auth.api";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import * as LucideIcons from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const { user: authUser, loading: authLoading, logout: authLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [company, setCompany] = useState<{ logo: string; company: string }>({ logo: "", company: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Use auth context user so we don't flash "Sign In" on page change when user is logged in
  const user = authUser;

  useEffect(() => {
    const loadCompany = async () => {
      try {
        // Try to get from cache first
        const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
        
        if (cachedCompany) {
          // Use cached data
          setCompany({ 
            logo: cachedCompany.logo || "/logo-removebg-preview.png", 
            company: cachedCompany.company || "Grace by Anu" 
          });
        } else {
          // Fetch from API
          const data = await getCompany();
          setCompany({ 
            logo: data.logo || "/logo-removebg-preview.png", 
            company: data.company || "Grace by Anu" 
          });
          // Cache the data (24 hours)
          setCachedData(CACHE_KEYS.COMPANY, data);
        }
      } catch (error) {
        console.error("Failed to load company:", error);
        // Try to use cached data as fallback
        const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
        if (cachedCompany) {
          setCompany({ 
            logo: cachedCompany.logo || "/logo-removebg-preview.png", 
            company: cachedCompany.company || "Grace by Anu" 
          });
        } else {
          setCompany({ logo: "/logo-removebg-preview.png", company: "Grace by Anu" });
        }
      }
    };
    loadCompany();
  }, []);

  // Process avatar URL from user (auth context or getMe response) for production
  const processAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return undefined;
    const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
    const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace("/api", "") : "";
    if (avatar.includes("localhost") || avatar.includes("127.0.0.1")) {
      const urlPath = avatar.replace(/^https?:\/\/[^/]+/, "");
      return `${apiBaseWithoutApi}${urlPath.startsWith("/") ? urlPath : "/" + urlPath}`;
    }
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
    return `${apiBaseWithoutApi}${avatar.startsWith("/") ? avatar : "/" + avatar}`;
  };

  // Initial avatar from auth user (so profile shows immediately on navigation)
  const initialAvatarUrl = useMemo(() => processAvatarUrl(user?.avatar), [user?.avatar]);

  // When user is logged in, optionally fetch fresh avatar from API (runs in background)
  useEffect(() => {
    if (!user) {
      setAvatarUrl(undefined);
      return;
    }
    setAvatarUrl(initialAvatarUrl ?? undefined);
    const token = localStorage.getItem("token");
    if (!token) return;
    getMe(token)
      .then((userData) => {
        if (userData?.user?.avatar) {
          setAvatarUrl(processAvatarUrl(userData.user.avatar) ?? undefined);
        }
      })
      .catch(() => {});
  }, [user, initialAvatarUrl]);

  const linkClasses = (path: string) => {
  const base = "text-sm transition-colors";
  const color = pathname === path 
    ? "font-medium underline underline-offset-4" 
    : "";

  return `${base} ${color}`;
};

  return (
    <header className="bg-white  text-black  shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <Link
          to="/"
          className="text-xl font-serif font-semibold flex items-center gap-2"
          style={{ color: "var(--theme-primary)", cursor: "pointer" }}
        >
          {company.logo && (
            <img
              src={company.logo.startsWith("http") ? company.logo : (company.logo ? `${import.meta.env.VITE_API_URL?.replace(/\/$/, "")}${company.logo.startsWith("/") ? "" : "/"}${company.logo}` : "/logo-removebg-preview.png")}
              alt="Logo"
              className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo-removebg-preview.png";
              }}
            />
          )}
          <span className="text-base sm:text-xl font-serif font-semibold">{company.company}</span>
        </Link>

        {/* CENTER: Nav links (desktop only) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={linkClasses("/")}
            style={{ 
              color: pathname === "/" ? "var(--theme-primary)" : "var(--theme-dark)",
              cursor: "pointer",
            }}
          >
            Home
          </Link>
          <Link 
            to="/shop" 
            className={linkClasses("/shop")}
            style={{ 
              color: pathname === "/shop" ? "var(--theme-primary)" : "var(--theme-dark)",
              cursor: "pointer",
            }}
          >
            Shop
          </Link>
          <Link 
            to="/blogs" 
            className={linkClasses("/blogs")}
            style={{ 
              color: pathname.startsWith("/blog") ? "var(--theme-primary)" : "var(--theme-dark)",
              cursor: "pointer",
            }}
          >
            Blogs
          </Link>
          <Link 
            to="/about-us" 
            className={linkClasses("/about-us")}
            style={{ 
              color: pathname === "/about-us" ? "var(--theme-primary)" : "var(--theme-dark)",
              cursor: "pointer",
            }}
          >
            About Us
          </Link>
        </nav>

        {/* RIGHT: Cart + Sign In + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Cart icon (always visible) */}
          <Link to="/cart" className="relative" style={{ cursor: "pointer" }}>
  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 " />
  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
  {totalItems}
</span>
</Link>
{/* Theme toggle button */}
{/* <button
  onClick={toggleTheme}
  className="p-2 rounded-lg bg-white  text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
  title="Toggle Theme"
>
  {theme === "light" ? "🌙" : "☀️"}
</button> */}


          {/* Sign In (desktop only) */}
          {/* <div className="hidden md:block">
            <Button className="border text-gray-700 bg-white  hover:bg-gray-100" onClick={() => navigate("/login")} >
              Sign In
            </Button>
          </div> */}
          <div className="hidden md:block">
  {authLoading ? (
    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" aria-hidden />
  ) : !user ? (
    <Button
      className="border text-white"
      style={{
        backgroundColor: "var(--theme-primary)",
        borderColor: "var(--theme-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--theme-dark)";
        e.currentTarget.style.borderColor = "var(--theme-dark)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--theme-primary)";
        e.currentTarget.style.borderColor = "var(--theme-primary)";
      }}
      onClick={async () => {
        if (navLoading) return;
        setNavLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          navigate("/login");
        } finally {
          setNavLoading(false);
        }
      }}
      loading={navLoading}
    >
      Sign In
    </Button>
  ) : (
     <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 overflow-hidden"
                title="Profile"
                style={{ cursor: "pointer" }}
              >
                {avatarUrl ? (
                  <img
                    key={avatarUrl}
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error("Navbar - Avatar image failed to load:", {
                        attemptedUrl: target.src,
                        userAvatar: user?.avatar
                      });
                      // Fallback to initials if image fails
                      target.style.display = "none";
                    }}
                    onLoad={() => {
                      console.log("Navbar - Avatar image loaded successfully:", avatarUrl);
                    }}
                  />
                ) : (
                  <span className="text-gray-800 font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <div className="p-4 text-black border-b">
                    <p className="font-semibold">{user.name}</p>
                    <p
                      className="text-sm text-gray-500 truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-black"
                    style={{ cursor: "pointer" }}
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      authLogout();
                      setDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-500"
                    style={{ cursor: "pointer" }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
    
  )}
</div>


          {/* Hamburger menu (mobile only) - Using AppSidebar component */}
          <div className="md:hidden text-black">
            <Button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 bg-gray-100 text-black hover:bg-gray-100 focus:outline-none focus:ring-0 border-0"
            >
              <Menu className="w-6 h-6 text-black" />
            </Button>
            <AppSidebar
              open={open}
              onOpenChange={setOpen}
              user={user}
              company={company}
              navLoading={navLoading}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
