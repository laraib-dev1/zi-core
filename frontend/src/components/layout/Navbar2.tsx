import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LandingSocialIconButtons from "@/components/landing/LandingSocialIconButtons";
import { getCompany } from "@/api/company.api";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";

const navLinks = [
  { to: "#home", label: "Home", hash: "home" },
  { to: "#about", label: "About me", hash: "about" },
  { to: "#portfolio", label: "Portfolio", hash: "portfolio" },
  { to: "#testimonials", label: "Testimonials", hash: "testimonials" }, // section to be added later
  { to: "#other-pages", label: "Other Pages", hash: "other-pages", hasDropdown: true },
  { to: "#contact", label: "Contact us", hash: "contact" },
];

// When bottom div has NO color: rounded pill, light pinkish-beige. Fixed height so page content can align with no gap.
const NAVBAR_HEIGHT = "h-16"; // 64px - use same value in SecondLanding for main offset
const variantNoColor = {
  wrapper: `flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 ${NAVBAR_HEIGHT}`,
  bar: "rounded-[2rem] px-6 py-2.5 w-full max-w-[1232px] flex items-center justify-between gap-4",
  barBg: "bg-white",
  text: "text-[var(--theme-primary)]",
  textInactive: "text-gray-500" as const,
  border: "",
};

// When bottom div HAS color: white bar, full width, no borders (2nd ss)
const variantHasColor = {
  wrapper: "py-0", // No horizontal padding - full width
  bar: "rounded-none px-6 py-3 w-full flex items-center justify-between gap-4",
  barBg: "bg-white",
  text: "text-[var(--theme-primary)]",
  textInactive: "text-gray-500" as const,
  border: "",
};

export interface OtherPagesItem {
  id: string;
  label: string;
}

export interface Navbar2Props {
  /** When true, use white navbar with dark borders (2nd ss). When false, use rounded beige navbar (1st ss). */
  bottomDivHasColor?: boolean;
  /** Items for "Other Pages" dropdown (only enabled sections not in main nav). When empty, dropdown shows no items or hides. */
  otherPagesItems?: OtherPagesItem[];
  /** Company name from developer panel */
  companyName?: string;
  /** Dynamic WhatsApp/Contact link for hire button */
  hireMeHref?: string;
  /**
   * Social URLs from developer company panel. Pass from landing when preloaded.
   * When omitted, Navbar loads `/api/company` so detail pages match without prop drilling.
   */
  companySocialLinks?: Record<string, string | undefined> | null;
  className?: string;
}

export default function Navbar2({
  bottomDivHasColor = false,
  otherPagesItems = [],
  companyName = "Grace by Anu",
  hireMeHref = "#",
  companySocialLinks,
  className,
}: Navbar2Props) {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const currentHash = hash?.replace("#", "") || "home";
  const isLanding = !pathname.startsWith("/project");
  /** Only show a nav item as active when we're on the landing page; on detail pages (service, course, project, blog, etc.) no item is active */
  const isOnLandingPage = pathname === "/";
  /** Second landing home: full nav + mobile drawer. Detail routes: brand + Hire Me + socials only (no section links / burger). */
  const isLandingHome = pathname === "/";
  const getHref = (to: string) => (isLanding ? to : `/${to}`);

  const handleNavClick = (e: React.MouseEvent, itemHash: string) => {
    setMenuOpen(false);
    e.preventDefault();
    const hashValue = itemHash.startsWith("#") ? itemHash : `#${itemHash}`;
    if (!isLanding) {
      navigate({ pathname: "/", hash: hashValue });
      return;
    }
    navigate({ pathname, hash: hashValue }, { replace: true });
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  /** Same as footer: only show icons for URLs saved on the Company page. */
  const [rawSocialLinks, setRawSocialLinks] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (companySocialLinks !== undefined && companySocialLinks !== null) {
      setRawSocialLinks(companySocialLinks as Record<string, string | undefined>);
      return;
    }
    const cached = getCachedData<any>(CACHE_KEYS.COMPANY);
    setRawSocialLinks((cached?.socialLinks || {}) as Record<string, string | undefined>);
    getCompany()
      .then((c) => setRawSocialLinks((c?.socialLinks || {}) as Record<string, string | undefined>))
      .catch(() => {});
  }, [companySocialLinks]);

  const navbarSocialLinks = {
    twitter: rawSocialLinks.twitter || rawSocialLinks.x || "",
    facebook: rawSocialLinks.facebook || "",
    linkedin: rawSocialLinks.linkedin || "",
    instagram: rawSocialLinks.instagram || "",
  };

  // Same slide logic as Navbar.tsx / AppSidebar: open -> next frame slide in
  useEffect(() => {
    if (menuOpen) {
      setSlideIn(false);
      setIsClosing(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideIn(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      setSlideIn(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!isLandingHome) return;
    if (!(menuOpen || isClosing)) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [menuOpen, isClosing, isLandingHome]);

  useEffect(() => {
    if (!isLandingHome) setMenuOpen(false);
  }, [isLandingHome]);

  const handleCloseMenu = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setIsClosing(false);
    }, 400);
  };

  const v = bottomDivHasColor ? variantHasColor : variantNoColor;

  const isActive = (itemHash: string) => isOnLandingPage && currentHash === itemHash;

  const linkClass = (itemHash: string) =>
    cn(
      "text-sm transition-colors hover:opacity-80 pb-1 border-b-2 border-transparent",
      isActive(itemHash) ? "font-medium text-[var(--theme-primary)] border-b-2 border-[var(--theme-primary)]" : (v as typeof variantHasColor).textInactive ?? v.text
    );

  const NavContent = () => (
    <>
      {/* Part 1: Brand - reload and scroll to top on click */}
      <a
        href="/"
        className="font-semibold text-lg shrink-0 text-[var(--theme-primary)] hover:opacity-90"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen(false);
          window.location.href = "/";
        }}
      >
        {companyName}
      </a>

      {/* Part 2: Nav links — only on second landing home; hidden on detail / portfolio routes */}
      {isLandingHome && (
      <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
        {navLinks.map((item) =>
          item.hasDropdown ? (
            <div
              key={item.to}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <a href={getHref(item.to)} className={cn(linkClass(item.hash), "flex items-center gap-1")} onClick={(e) => handleNavClick(e, item.hash)}>
                {item.label} <ChevronDown className={cn("w-3 h-3 transition-transform", dropdownOpen && "rotate-180")} />
              </a>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 py-2 min-w-[180px] max-w-[240px] max-h-[70vh] overflow-y-auto bg-white rounded shadow-lg border border-gray-200 z-50">
                  {otherPagesItems.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No other sections</div>
                  ) : (
                    otherPagesItems.map((opt) => (
                      <a
                        key={opt.id}
                        href={`#${opt.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                        onClick={(e) => {
                          handleNavClick(e, opt.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <a
              key={item.to}
              href={getHref(item.to)}
              className={linkClass(item.hash)}
              onClick={(e) => handleNavClick(e, item.hash)}
            >
              {item.label}
            </a>
          )
        )}
      </nav>
      )}

      {/* Part 3: Social icons + hire me — on detail pages always visible (including mobile); on home, desktop only until burger opens */}
      <div
        className={cn(
          "flex items-center gap-1 shrink-0",
          "hidden md:flex"
        )}
      >
        <a
          href={hireMeHref}
          target={hireMeHref !== "#" ? "_blank" : undefined}
          rel={hireMeHref !== "#" ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          Hire Me
        </a>
        <LandingSocialIconButtons links={navbarSocialLinks} useDefaults={false} size="sm" />
      </div>
    </>
  );

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <div className={v.wrapper}>
        <div className={cn(v.bar, v.barBg, "shadow-sm")}>
          <NavContent />

          {/* Burger + drawer for mobile on home + detail pages */}
          {(
                <button
                  type="button"
                  className={cn("md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--theme-primary)]")}
                  aria-label="Open menu"
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
          )}

          {(menuOpen || isClosing) && (
            <>
              <div
                role="presentation"
                aria-hidden
                className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
                style={{
                  opacity: menuOpen || isClosing ? 1 : 0,
                  pointerEvents: menuOpen && !isClosing ? "auto" : "none",
                }}
                onClick={handleCloseMenu}
              />
              <div
                role="dialog"
                aria-label="Navigation menu"
                className="fixed top-0 right-0 z-50 h-full w-[280px] max-w-[85vw] bg-white text-black shadow-xl flex flex-col p-6 pt-12"
                style={{
                  transform: slideIn && !isClosing ? "translateX(0)" : "translateX(100%)",
                  transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseMenu}
                  className="absolute right-4 top-4 rounded p-1 hover:bg-gray-100 text-gray-700"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
                <a
                  href="/"
                  className="font-semibold text-lg text-[var(--theme-primary)]"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseMenu();
                    window.location.href = "/";
                  }}
                >
                  {companyName}
                </a>
                {isLandingHome && (
                  <nav className="flex flex-col gap-1.5 mt-6">
                    {navLinks.map((item) =>
                      item.hasDropdown ? (
                        <div key={item.to} className="flex flex-col">
                          <button
                            type="button"
                            className={cn(
                              "py-2 text-sm flex items-center justify-between text-left",
                              linkClass(item.hash)
                            )}
                            onClick={() => setMobileDropdownOpen((open) => !open)}
                          >
                            <span>{item.label}</span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                mobileDropdownOpen && "rotate-180"
                              )}
                            />
                          </button>
                          {mobileDropdownOpen && otherPagesItems.length > 0 && (
                            <div className="pl-3 pb-1 flex flex-col gap-1">
                              {otherPagesItems.map((opt) => (
                                <a
                                  key={opt.id}
                                  href={`#${opt.id}`}
                                  className="py-1.5 text-xs text-gray-700 border-l border-gray-200 pl-3"
                                  onClick={(e) => {
                                    handleNavClick(e, opt.id);
                                    handleCloseMenu();
                                    setMobileDropdownOpen(false);
                                  }}
                                >
                                  {opt.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <a
                          key={item.to}
                          href={getHref(item.to)}
                          className={cn("py-2 text-sm", linkClass(item.hash))}
                          onClick={(e) => {
                            handleNavClick(e, item.hash);
                            handleCloseMenu();
                          }}
                        >
                          {item.label}
                        </a>
                      )
                    )}
                  </nav>
                )}
                <a
                  href={hireMeHref}
                  target={hireMeHref !== "#" ? "_blank" : undefined}
                  rel={hireMeHref !== "#" ? "noopener noreferrer" : undefined}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white",
                    isLandingHome ? "mt-3" : "mt-6"
                  )}
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  Hire Me
                </a>
                <div className="pt-4 mt-4 justify-start">
                  <LandingSocialIconButtons links={navbarSocialLinks} useDefaults={false} size="sm" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
