import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ShoppingBag, BookOpen, User, LogOut, X } from "lucide-react";
import Button from "./ui/buttons/Button";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  user?: any;
  company?: { company: string };
  navLoading?: boolean;
}

export function AppSidebar({
  open,
  onOpenChange,
  user,
  company,
  navLoading,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const [slideIn, setSlideIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Open: start off-screen (right), then next frame slide in
  useEffect(() => {
    if (open) {
      setSlideIn(false);
      setIsClosing(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideIn(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      setSlideIn(false);
    }
  }, [open]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onOpenChange?.(false);
      setIsClosing(false);
    }, 400);
  };

  const menuItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Shop", url: "/shop", icon: ShoppingBag },
    { title: "Blogs", url: "/blogs", icon: BookOpen },
    { title: "About Us", url: "/about-us", icon: User },
  ];

  if (!open && !isClosing) return null;

  return (
    <>
      {/* Overlay - right se panel ke saath dim background */}
      <div
        role="presentation"
        aria-hidden
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
        style={{
          opacity: open || isClosing ? 1 : 0,
          pointerEvents: open && !isClosing ? "auto" : "none",
        }}
        onClick={handleClose}
      />
      {/* Panel - hamesha right edge se, transform se slide */}
      <div
        role="dialog"
        aria-label="Navigation menu"
        className="fixed top-0 right-0 z-50 h-full w-64 max-w-[85vw] bg-white text-black shadow-xl flex flex-col p-6"
        style={{
          transform: slideIn && !isClosing ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded p-1 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <nav className="flex flex-col gap-4 mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={() => onOpenChange?.(false)}
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 py-2"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="mt-auto flex flex-col gap-2">
            <Button
              className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 flex items-center gap-2 justify-start"
              onClick={() => {
                onOpenChange?.(false);
                navigate("/profile");
              }}
            >
              <User size={16} /> Profile
            </Button>
            <Button
              className="w-full border border-gray-300 text-red-500 bg-white hover:bg-red-50 flex items-center gap-2 justify-start"
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                onOpenChange?.(false);
                navigate("/login");
              }}
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        ) : (
          <Button
            className="mt-auto border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
            onClick={async () => {
              if (navLoading) return;
              onOpenChange?.(false);
              navigate("/login");
            }}
            loading={navLoading}
          >
            Sign In
          </Button>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold mb-1" style={{ color: "var(--theme-primary)" }}>
              {company?.company || "Grace by Anu"}
            </p>
            <p>© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
