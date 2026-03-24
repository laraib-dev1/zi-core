import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getUserWishlist,
  removeFromWishlist,
} from "@/api/user.api";
import { createQuery } from "@/api/query.api";
import { spacing } from "@/utils/spacing";
import { createReview } from "@/api/review.api";
import { getProducts } from "@/api/product.api";
import { getEnabledProfilePages, getProfilePageBySlug, getEnabledBaseProfileTabs } from "@/api/profilepage.api";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageLoader from "@/components/ui/PageLoader";
import FilterTabs from "@/components/ui/FilterTabs";
import { Input } from "@/components/ui/input";
import { updateAvatar } from "@/api/auth.api";
import {
  User,
  Package,
  MapPin,
  Heart,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import type { UserProfile as UserProfileType, Address, Order } from "@/api/user.api";

type TabType = "dashboard" | "profile" | "addresses" | "orders" | "wishlist" | "queries" | "reviews" | string;

export default function UserProfile() {
  console.log('🚀🚀🚀 UserProfile component RENDERED 🚀🚀🚀');
  
  // Add class to body/html/root to match background
  useEffect(() => {
    document.body.classList.add('profile-page');
    document.documentElement.classList.add('profile-page');
    const root = document.getElementById('root');
    if (root) root.classList.add('profile-page');
    
    return () => {
      document.body.classList.remove('profile-page');
      document.documentElement.classList.remove('profile-page');
      if (root) root.classList.remove('profile-page');
    };
  }, []);
  const navigate = useNavigate();
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [profilePages, setProfilePages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Base tabs state from API
  const [baseTabsFromAPI, setBaseTabsFromAPI] = useState<any[]>([]);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }
    
    if (!authUser) {
      navigate("/login");
      return;
    }
    
    // Double check token exists before loading data
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    loadData();
  }, [authUser, authLoading, navigate]);

  const loadData = async () => {
    // Check token AND authUser before making any API calls
    const token = localStorage.getItem("token");
    if (!token || !authUser) {
      setLoading(false);
      return; // Don't make any API calls if no token or user
    }
    
    try {
      setLoading(true);
      // Only make API calls if we have both token and authUser
      const [profileData, addressesData, ordersData, wishlistData, profilePagesData, baseTabsData] = await Promise.all([
        getUserProfile().catch(() => null), // Silently catch all errors
        getUserAddresses().catch(() => {
          // Fallback to localStorage if backend fails
          try {
            const savedAddresses = localStorage.getItem("savedAddresses");
            if (savedAddresses) {
              const parsed = JSON.parse(savedAddresses);
              return Array.isArray(parsed) ? parsed : [];
            }
          } catch (e) {
            // Silent
          }
          return [];
        }),
        getUserOrders().catch(() => []), // Silently catch all errors
        getUserWishlist().catch(() => []), // Silently catch all errors
        getEnabledProfilePages().catch((err) => {
          console.error("Failed to load profile pages:", err);
          return [];
        }),
        getEnabledBaseProfileTabs().catch((err) => {
          console.error("Failed to load base tabs from API:", err);
          // Fallback: return null if API fails (will use localStorage)
          return null;
        }),
      ]);
      
      if (profileData) {
        // Process avatar URL for production/Vercel
        if (profileData.avatar) {
          const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
          const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === "localhost" || 
            window.location.hostname === "127.0.0.1"
          );
          const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
          const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
          
          let avatarUrl = profileData.avatar;
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
          
          console.log("UserProfile - Avatar URL processing:", {
            original: profileData.avatar,
            isCloudinary: profileData.avatar?.includes('cloudinary'),
            final: avatarUrl,
            apiBase: API_BASE_URL,
            apiBaseWithoutApi
          });
          
          profileData.avatar = avatarUrl;
        }
        setProfile(profileData);
      }
      console.log("Loaded addresses:", addressesData);
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      // Filter out null/undefined products from wishlist
      // Backend returns products directly (from wishlist.map(item => item.productId))
      // So we need to handle both cases: direct product objects or nested productId
      const validWishlist = Array.isArray(wishlistData) 
        ? wishlistData
            .map((item: any) => {
              // Handle both direct product objects and nested productId
              const product = item?.productId || item;
              return product && product._id ? product : null;
            })
            .filter((item: any) => item !== null)
        : [];
      console.log("Wishlist data processed:", validWishlist);
      setWishlist(validWishlist);
      
      // Handle profile pages data (CUSTOM pages only, not base tabs)
      // Base tabs are handled via localStorage in the useMemo hook
      console.log("Profile pages API response (CUSTOM pages only):", profilePagesData);
      if (Array.isArray(profilePagesData)) {
        setProfilePages(profilePagesData);
        console.log(`Loaded ${profilePagesData.length} enabled CUSTOM profile pages`);
      } else if (profilePagesData && Array.isArray(profilePagesData.data)) {
        setProfilePages(profilePagesData.data);
        console.log(`Loaded ${profilePagesData.data.length} enabled CUSTOM profile pages`);
      } else {
        console.warn("Invalid profile pages data format:", profilePagesData);
        setProfilePages([]);
        console.log("No CUSTOM profile pages found. Base tabs are handled via API.");
      }
      
      // Update base tabs from API response
      if (baseTabsData && Array.isArray(baseTabsData)) {
        console.log("📥 Loaded base tabs from API:", baseTabsData);
        setBaseTabsFromAPI(baseTabsData);
      } else if (baseTabsData && baseTabsData.data && Array.isArray(baseTabsData.data)) {
        console.log("📥 Loaded base tabs from API (nested):", baseTabsData.data);
        setBaseTabsFromAPI(baseTabsData.data);
      } else {
        console.log("⚠️ No base tabs data from API, using defaults");
        // Set default enabled tabs if API fails
        setBaseTabsFromAPI([]);
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh base tabs from API periodically (like admin panel does)
  useEffect(() => {
    const refreshBaseTabs = async () => {
      try {
        const baseTabsData = await getEnabledBaseProfileTabs();
        if (baseTabsData && Array.isArray(baseTabsData)) {
          setBaseTabsFromAPI(baseTabsData);
        } else if (baseTabsData && baseTabsData.data && Array.isArray(baseTabsData.data)) {
          setBaseTabsFromAPI(baseTabsData.data);
        }
      } catch (err) {
        console.error("Failed to refresh base tabs:", err);
      }
    };
    
    // Refresh immediately and then every 5 seconds
    refreshBaseTabs();
    const interval = setInterval(refreshBaseTabs, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Create a map of enabled tabs from API data
  const enabledTabIds = useMemo(() => {
    const enabledIds = new Set<string>();
    baseTabsFromAPI.forEach((tab: any) => {
      if (tab.enabled !== false) {
        enabledIds.add(tab._id || tab.id);
      }
    });
    return enabledIds;
  }, [baseTabsFromAPI]);
  
  const allBaseTabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "addresses" as TabType, label: "Address", icon: MapPin },
    { id: "wishlist" as TabType, label: "Wishlist", icon: Heart },
    { id: "orders" as TabType, label: "Orders", icon: Package },
    { id: "reviews" as TabType, label: "Reviews", icon: Star },
    { id: "queries" as TabType, label: "Support", icon: MessageSquare },
  ];
  
  // Filter base tabs based on API data - only show enabled tabs
  const baseTabs = allBaseTabs.filter(tab => {
    // If we have API data, use it. Otherwise, show all tabs by default.
    if (baseTabsFromAPI.length > 0) {
      return enabledTabIds.has(tab.id);
    }
    // If no API data yet, show all tabs (will be filtered once API loads)
    return true;
  });
  
  console.log('📊 Profile Tabs Status:');
  console.log('  - Total base tabs:', allBaseTabs.length);
  console.log('  - Enabled tabs from API:', baseTabsFromAPI.length);
  console.log('  - Showing tabs:', baseTabs.map(t => t.id));

  // Add profile pages as tabs - only enabled pages
  const profilePageTabs = profilePages
    .filter((page: any) => page.enabled === true)
    .map((page: any) => ({
      id: `profile-page-${page._id}` as TabType,
      label: page.title,
      icon: FileText,
      isProfilePage: true,
      pageData: page,
    }));

  const tabs = [...baseTabs, ...profilePageTabs];
  
  // Debug: Log final tabs array
  useEffect(() => {
    console.log('=== Final Tabs Array ===');
    console.log('Base tabs from API:', baseTabsFromAPI.length);
    console.log('Base tabs count:', baseTabs.length);
    console.log('Base tabs IDs:', baseTabs.map(t => t.id));
    console.log('Profile page tabs count:', profilePageTabs.length);
    console.log('Total tabs:', tabs.length);
    console.log('Tab IDs:', tabs.map(t => t.id));
    console.log('=======================');
  }, [tabs, baseTabs, profilePageTabs, baseTabsFromAPI]);
  
  // Check if active tab is still available, if not redirect to first available tab
  useEffect(() => {
    const isActiveTabAvailable = tabs.some(tab => tab.id === activeTab);
    if (!isActiveTabAvailable && tabs.length > 0) {
      console.log(`Active tab "${activeTab}" is not available, redirecting to first available tab`);
      // Try to redirect to dashboard first, if not available, use first tab
      const dashboardTab = tabs.find(tab => tab.id === "dashboard");
      const firstTab = dashboardTab || tabs[0];
      if (firstTab) {
        console.log(`Redirecting to tab: ${firstTab.id}`);
        setActiveTab(firstTab.id);
      }
    }
  }, [tabs, activeTab]);
  
  // Debug: Log tabs when profile pages change
  useEffect(() => {
    console.log("=== Profile Pages Debug ===");
    console.log("Total profile pages from API:", profilePages.length);
    console.log("Enabled profile pages:", profilePages.filter((p: any) => p.enabled === true).length);
    console.log("Base tabs from API:", baseTabsFromAPI.length);
    console.log("Available tabs:", tabs.map(t => t.id));
    if (profilePages.length > 0) {
      profilePages.forEach((page: any, index: number) => {
        console.log(`Page ${index + 1}:`, {
          title: page.title,
          id: page._id,
          enabled: page.enabled,
          slug: page.slug
        });
      });
    } else {
      console.log("No profile pages found. Create and enable them in SP Panel → Profile Pages.");
    }
    console.log("Total tabs (including profile pages):", tabs.length);
  }, [profilePages, baseTabsFromAPI, tabs]);

  if (loading) {
    return (
      <div data-profile-page style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div className={`flex items-center justify-center flex-1 ${spacing.navbar.offset}`}>
          <PageLoader />
        </div>
        <div className="w-full" style={{ marginTop: "auto", flexShrink: 0, paddingTop: "20px" }}>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div data-profile-page style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} w-full flex-1`} style={{ minHeight: 0 }}>
        <section className="w-full" style={{ minHeight: 0, paddingTop: "20px", paddingBottom: "0px", marginBottom: "0px" }}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="mb-6">
              {profile?.avatar ? (
                <img
                  key={profile.avatar}
                  src={profile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2"
                  style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error("UserProfile - Avatar image failed to load:", {
                      attemptedUrl: target.src,
                      profileAvatar: profile?.avatar
                    });
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement("div");
                      fallback.className = "w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 border-2";
                      fallback.style.borderColor = "var(--theme-primary, #8B5E3C)";
                      const span = document.createElement("span");
                      span.className = "text-2xl font-bold text-gray-700";
                      span.textContent = (profile?.name?.charAt(0) || authUser?.name?.charAt(0) || "U").toUpperCase();
                      fallback.appendChild(span);
                      parent.insertBefore(fallback, target);
                    }
                  }}
                  onLoad={() => {
                    console.log("UserProfile - Avatar image loaded successfully:", profile?.avatar);
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 border-2"
                  style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}>
                  <span className="text-2xl font-bold text-gray-700">
                    {profile?.name?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <h3 className="text-center font-semibold text-gray-900">{profile?.name || authUser?.name}</h3>
              <p className="text-center text-sm text-gray-600">{profile?.email || authUser?.email}</p>
            </div>
            <nav className="space-y-1">
              {tabs.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No tabs available
                </div>
              ) : (
                tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "text-white font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        style={activeTab === tab.id ? { backgroundColor: "var(--theme-primary)" } : {}}
                      >
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 sm:p-8" style={{ minHeight: "auto" }}>
            {activeTab === "dashboard" && <DashboardTab orders={orders} addresses={addresses} wishlist={wishlist} />}
            {activeTab === "profile" && <ProfileTab profile={profile} onUpdate={loadData} />}
            {activeTab === "addresses" && <AddressesTab addresses={addresses} onUpdate={loadData} />}
            {activeTab === "orders" && <OrdersTab orders={orders} onUpdate={loadData} />}
            {activeTab === "wishlist" && <WishlistTab wishlist={wishlist} onUpdate={loadData} />}
            {activeTab === "queries" && <QueriesTab />}
            {activeTab === "reviews" && <ReviewsTab orders={orders} />}
            {/* Profile Pages */}
            {activeTab.startsWith("profile-page-") && (() => {
              const pageId = activeTab.replace("profile-page-", "");
              const page = profilePages.find((p: any) => p._id === pageId);
              console.log("Rendering profile page:", { pageId, page, allPages: profilePages });
              if (!page) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Profile page not found.</p>
                  </div>
                );
              }
              return (
                <div>
                  <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>{page.title}</h2>
                  {page.subInfo && (
                    <p className="text-gray-600 mb-4">{page.subInfo}</p>
                  )}
                  <div 
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: page.content || "<p>No content available.</p>" }}
                  />
                </div>
              );
            })()}
          </div>
          </div>
        </div>
        </section>
      </main>
      <div className="w-full" style={{ marginTop: "auto", flexShrink: 0, paddingTop: "20px", paddingBottom: "0", marginBottom: "0" }}>
        <Footer />
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ orders, addresses, wishlist }: { orders: Order[]; addresses: Address[]; wishlist: any[] }) {
  const recentOrders = orders.slice(0, 3);
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  
  return (
    <div>
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>Dashboard</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="theme-bg-light p-4 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Pending Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Saved Address</h3>
          <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="border rounded-lg py-4 px-0 sm:px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order._id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-900">${order.bill.toFixed(2)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    order.status === "Complete" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <Package size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-sm text-gray-700">View All Orders</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <MapPin size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-sm text-gray-700">Manage Addresses</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <Heart size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-sm text-gray-700">Wishlist ({wishlist.length})</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <MessageSquare size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-sm text-gray-700">Get Support</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ profile, onUpdate }: { profile: UserProfileType | null; onUpdate: () => void }) {
  const { success, error } = useToast();
  const [tab, setTab] = useState<"overview" | "edit" | "password">("overview");
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });
  
  // Update formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | undefined>(profile?.avatar);

  // Update avatar when profile changes
  useEffect(() => {
    if (profile?.avatar) {
      // Handle avatar URL for production/Vercel
      const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
      const isLocalhost = typeof window !== 'undefined' && (
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1"
      );
      const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
      const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
      
      let avatarUrl = profile.avatar;
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
      setProfileAvatar(avatarUrl);
    }
  }, [profile?.avatar]);

  // File select handler
  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      error("Please login to update profile");
      return;
    }

    try {
      setSavingProfile(true);
      
      let newAvatar: string | undefined = profile?.avatar;

      // Upload avatar if file selected
      if (editAvatarFile) {
        try {
          const res = await updateAvatar(editAvatarFile, token);
          newAvatar = res.avatar;
          setEditAvatarPreview(null);
          setEditAvatarFile(null);
          setProfileAvatar(newAvatar);
        } catch (avatarErr: any) {
          console.error("Avatar upload error:", avatarErr);
          const errorMessage = avatarErr?.response?.data?.message || avatarErr?.message || "Failed to upload avatar";
          error(errorMessage);
          throw avatarErr; // Re-throw to stop profile update
        }
      }

      // Update profile
      await updateUserProfile(formData);
      
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
      onUpdate();
    } catch (err: any) {
      setProfileMsg("Failed to update profile");
      setTimeout(() => setProfileMsg(""), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      error("Please fill in all password fields");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      error("New password must be at least 6 characters long");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMsg("Password updated successfully!");
      setTimeout(() => setPasswordMsg(""), 3000);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (err: any) {
      setPasswordMsg("Failed to update password");
      setTimeout(() => setPasswordMsg(""), 3000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full text-black">
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>Profile Settings</h2>

      {/* PROFILE BOX */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={editAvatarPreview || profileAvatar || "/avatar.png"}
          className="w-20 h-20 rounded-full object-cover border-2"
          style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}
          alt="avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/avatar.png" && !target.src.includes("avatar.png")) {
              target.src = "/avatar.png";
            }
          }}
        />
        <div>
          <h3 className="text-xl font-semibold">{profile?.name || "User"}</h3>
          <p className="text-gray-500">{profile?.email || "N/A"}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-4">
        <FilterTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "edit", label: "Edit" },
            { id: "password", label: "Password" },
          ]}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId as any)}
        />
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="py-6 px-0 sm:p-6 bg-gray-50 rounded-lg" style={{ minHeight: "auto" }}>
          <h3 className="font-semibold mb-3">Profile Details</h3>
          <p><strong>Full Name:</strong> {profile?.name || "N/A"}</p>
          <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
        </div>
      )}

      {/* EDIT PROFILE */}
      {tab === "edit" && (
        <div className="py-6 px-0 sm:p-6 bg-gray-50 text-black rounded-lg space-y-4">
          {/* Avatar preview + change */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={editAvatarPreview || profileAvatar || "/avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 cursor-pointer"
              style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}
              onClick={() => document.getElementById("avatarInputEdit")?.click()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/avatar.png" && !target.src.includes("avatar.png")) {
                  target.src = "/avatar.png";
                }
              }}
            />
            <input
              type="file"
              accept="image/*"
              id="avatarInputEdit"
              className="hidden"
              onChange={handleEditAvatarChange}
            />
          </div>

          <div>
            <label className="font-medium">Full Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="font-medium">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button 
            onClick={handleUpdateProfile} 
            disabled={savingProfile}
            className="px-4 h-12 theme-button text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>

          {profileMsg && (
            <p className={`mt-2 ${profileMsg.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {profileMsg}
            </p>
          )}
        </div>
      )}

      {/* PASSWORD */}
      {tab === "password" && (
        <div className="py-6 px-0 sm:p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="font-medium">Current Password</label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <label className="font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <label className="font-medium">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword}
            className="px-4 h-12 theme-button text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
          
          {passwordMsg && (
            <p className={`mt-2 ${passwordMsg.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {passwordMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Addresses Tab Component
function AddressesTab({ addresses, onUpdate }: { addresses: Address[]; onUpdate: () => void }) {
  const { success, error } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Address, "_id">>({
    firstName: "",
    lastName: "",
    province: "",
    city: "",
    area: "",
    postalCode: "",
    phone: "",
    line1: "",
    isDefault: false,
  });

  const handleAdd = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phone || 
        !formData.line1 || !formData.city || !formData.province || !formData.postalCode) {
      error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAddresses = await addUserAddress(formData);
      success("Address added successfully!");
      setShowAddForm(false);
      setFormData({
        firstName: "",
        lastName: "",
        province: "",
        city: "",
        area: "",
        postalCode: "",
        phone: "",
        line1: "",
        isDefault: false,
      });
      // Force refresh to get latest data
      await onUpdate();
    } catch (err: any) {
      console.error("Error adding address:", err);
      error(err.response?.data?.message || err.message || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (addressId: string) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      await updateUserAddress(addressId, formData);
      success("Address updated successfully!");
      setEditingId(null);
      onUpdate();
    } catch (err: any) {
      error(err.message || "Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const handleDelete = (addressId: string) => {
    setDeleteConfirm(addressId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteUserAddress(deleteConfirm);
      success("Address deleted successfully!");
      setDeleteConfirm(null);
      onUpdate();
    } catch (err: any) {
      error(err.message || "Failed to delete address");
      setDeleteConfirm(null);
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address._id || null);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      province: address.province,
      city: address.city,
      area: address.area || "",
      postalCode: address.postalCode,
      phone: address.phone,
      line1: address.line1,
      isDefault: address.isDefault || false,
    });
  };

  return (
    <div>
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className={`flex justify-between items-center ${spacing.inner.gapBottom}`}>
        <h2 className="text-2xl font-bold theme-heading">Address</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="theme-button flex items-center gap-2 px-4 h-12 rounded-lg"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 border rounded-lg py-4 px-0 sm:px-4">
          <h3 className="font-semibold mb-4 text-gray-900">Add</h3>
          <AddressForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleAdd}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setShowAddForm(false);
              setFormData({
                firstName: "",
                lastName: "",
                province: "",
                city: "",
                area: "",
                postalCode: "",
                phone: "",
                line1: "",
                isDefault: false,
              });
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div>
            <p className="text-gray-600 mb-2">No addresses saved yet</p>
            <p className="text-sm text-gray-500">Add your first address using the button above</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address._id} className="border rounded-lg py-4 px-0 sm:px-4">
              {editingId === address._id ? (
                <AddressForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(address._id!)}
                  isSubmitting={isSubmitting}
                  onCancel={() => {
                    setEditingId(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      province: "",
                      city: "",
                      area: "",
                      postalCode: "",
                      phone: "",
                      line1: "",
                      isDefault: false,
                    });
                  }}
                />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {address.isDefault && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                          Default
                        </span>
                      )}
                      <p className="font-semibold text-gray-900">{address.firstName} {address.lastName}</p>
                      <p className="text-sm text-gray-700">{address.line1}</p>
                      {address.area && <p className="text-sm text-gray-700">{address.area}</p>}
                      <p className="text-sm text-gray-700">{address.city}, {address.province}</p>
                      <p className="text-sm text-gray-700">Postal: {address.postalCode}</p>
                      <p className="text-sm text-gray-700">Phone: {address.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(address)}
                        className="p-2 theme-text-primary rounded hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(address._id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Address Form Component
function AddressForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isSubmitting = false,
}: {
  formData: Omit<Address, "_id">;
  setFormData: (data: Omit<Address, "_id">) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full border rounded-lg p-2 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full border rounded-lg p-2 text-gray-900"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border rounded-lg p-2 text-gray-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 1 *</label>
        <input
          type="text"
          value={formData.line1}
          onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
          className="w-full border rounded-lg p-2 text-gray-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Area</label>
        <input
          type="text"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          className="w-full border rounded-lg p-2 text-gray-900"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full border rounded-lg p-2 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Province *</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full border rounded-lg p-2 text-gray-900"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Postal Code *</label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          className="w-full border rounded-lg p-2 text-gray-900"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4"
        />
        <label className="text-sm text-gray-700">Set as default address</label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="theme-button px-4 h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Orders Tab Component
function OrdersTab({ orders, onUpdate }: { orders: Order[]; onUpdate: () => void }) {
  const { success, error } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancel":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = async (orderId: string) => {
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
      setShowDetailsModal(true);
    } catch (err: any) {
      error(err.message || "Failed to load order details");
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setCancelConfirm(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!cancelConfirm) return;
    setIsCancelling(true);
    try {
      await cancelOrder(cancelConfirm);
      success("Order cancelled successfully! Admin has been notified.");
      setCancelConfirm(null);
      onUpdate(); // Refresh orders list
    } catch (err: any) {
      error(err.message || "Failed to cancel order");
      setCancelConfirm(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg py-4 px-0 sm:px-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">Order #{order._id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm mb-2 text-gray-900"><strong className="text-gray-700">Items:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-900">
                      {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Total:</strong> ${order.bill.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Payment:</strong> {order.payment}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {order.status === "Pending" && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={isCancelling}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(order._id)}
                    className="px-4 h-12 theme-button rounded-lg text-sm w-full sm:w-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder._id}</p>
                  <p className="text-sm text-gray-600 mt-2">Order Date</p>
                  <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-900"><strong className="text-gray-700">Name:</strong> {selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-900"><strong className="text-gray-700">Phone:</strong> {selectedOrder.phoneNumber}</p>
                </div>

                {/* Address */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.address.line1}<br />
                    {selectedOrder.address.area && `${selectedOrder.address.area}, `}
                    {selectedOrder.address.city}, {selectedOrder.address.province}<br />
                    {selectedOrder.address.postalCode}
                  </p>
                </div>

                {/* Items */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-900">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Total */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">Payment Method:</span>
                    <span className="text-gray-900 font-medium">{selectedOrder.payment}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${selectedOrder.bill.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wishlist Tab Component
function WishlistTab({ wishlist, onUpdate }: { wishlist: any[]; onUpdate: () => void }) {
  return (
    <div>
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((product: any) => {
            // Backend returns products directly, but handle both cases for safety
            const productData = product?.productId || product;
            if (!productData || !productData._id) {
              console.warn("Invalid product in wishlist:", product);
              return null;
            }
            
            const productImage = productData.image1 || productData.image2 || productData.image3 || productData.image4 || productData.image5 || productData.image6 || productData.image || "/product.png";
            const discount = productData.discount || 0;

            return (
              <ProductCard
                key={productData._id}
                id={productData._id}
                name={productData.name}
                price={productData.price}
                image={productImage}
                offer={discount > 0 ? discount.toString() : undefined}
                isInWishlist={true}
                showHeartAlways={true}
                onRemove={onUpdate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Queries Tab Component
function QueriesTab() {
  const { success, error } = useToast();
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    email: authUser?.email || "",
    subject: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.subject || !formData.description) {
      error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await createQuery(formData);
      success("Your query has been submitted successfully!");
      setFormData({ 
        email: authUser?.email || "", 
        subject: "", 
        description: "" 
      });
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>Support & Help</h2>
      <div className="space-y-4">
        <div className="border rounded-lg">
          <div className="px-0 sm:px-6 pt-4 sm:pt-6 pb-4">
            <h3 className="font-semibold mb-2 text-gray-900">Need Help?</h3>
            <p className="text-gray-700 mb-4">Contact our support team for assistance with your orders or account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 px-0 pb-4 sm:px-6 sm:pb-6 sm:pt-0">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter here"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter here"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter here"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none resize-none text-gray-900"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 h-12 theme-button rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ orders }: { orders: Order[] }) {
  const { success, error } = useToast();
  const { user: authUser } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; orderId: string; productId?: string } | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Only show products from completed orders
  const completedOrders = orders.filter(o => o.status === "Complete" || o.status === "Completed");
  
  const handleWriteReview = (item: { name: string; quantity: number; price: number }, orderId: string) => {
    // Try to find product ID from the item (if available)
    setSelectedProduct({
      name: item.name,
      orderId: orderId,
      productId: (item as any).productId || (item as any).id || undefined,
    });
    setShowReviewModal(true);
    setReviewData({ rating: 0, comment: "" });
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;

    if (!authUser) {
      error("Please login to submit a review");
      return;
    }

    if (reviewData.rating === 0) {
      error("Please select a rating");
      return;
    }

    if (!reviewData.comment.trim()) {
      error("Please write a review comment");
      return;
    }

    setSubmitting(true);
    try {
      // Verify token exists
      const token = localStorage.getItem("token");
      if (!token) {
        error("Please login to submit a review");
        setSubmitting(false);
        return;
      }

      // If productId is not available, search for it by product name
      let productId: string | undefined = selectedProduct.productId;
      if (!productId) {
        const products = await getProducts();
        const product = products.find((p: any) => p.name === selectedProduct.name);
        if (!product) {
          error("Product not found. Please contact support.");
          setSubmitting(false);
          return;
        }
        productId = product._id;
      }

      if (!productId) {
        error("Product ID is required. Please contact support.");
        setSubmitting(false);
        return;
      }

      await createReview({
        productId: productId,
        productName: selectedProduct.name,
        orderId: selectedProduct.orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      success("Review submitted successfully!");
      setShowReviewModal(false);
      setReviewData({ rating: 0, comment: "" });
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Review submission error:", err);
      if (err?.response?.status === 401) {
        error("Please login to submit a review. Your session may have expired.");
      } else {
        error(err?.response?.data?.message || err.message || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className={`text-2xl font-bold theme-heading ${spacing.inner.gapBottom}`}>My Reviews</h2>
      {completedOrders.length === 0 ? (
        <p className="text-gray-600">You haven't completed any orders yet. Reviews are available after order completion.</p>
      ) : (
        <div className="space-y-4">
          {completedOrders.map((order) => (
            <div key={order._id} className="border rounded-lg py-4 px-0 sm:px-4">
              <p className="font-semibold mb-2 text-gray-900">Order #{order._id.substring(0, 8)}</p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleWriteReview(item, order._id)}
                      className="px-4 h-12 theme-button rounded-lg text-sm"
                    >
                      Write Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold theme-heading">Write Review</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedProduct(null);
                  setReviewData({ rating: 0, comment: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-900 font-medium mb-2">Product: {selectedProduct.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={star <= reviewData.rating ? "fill-(--theme-primary) text-(--theme-primary)" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Your Review</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--theme-primary) focus:border-(--theme-primary) text-gray-900 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedProduct(null);
                  setReviewData({ rating: 0, comment: "" });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 px-4 h-12 theme-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

