import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Facebook, Instagram } from "lucide-react";
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from "@/components/layout/Container12";

/**
 * Reusable Hero Banner with configurable theme, content, and layout.
 *
 * @example
 * // Dark theme, with right image, left-aligned
 * <HeroBannerFull theme="white" backgroundImage="/hero.png" showImage={true} textAlign="left" ... />
 *
 * @example
 * // Light theme, no right image, center-aligned
 * <HeroBannerFull theme="black" backgroundImage="/bg.jpg" showImage={false} textAlign="center" ... />
 */

const DribbbleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.054 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
  </svg>
);

export interface HeroBannerButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface HeroBannerFullProps {
  /** Theme: "black" = dark text/buttons, "white" = light text/buttons (for contrast on bg image) */
  theme?: "black" | "white";
  /** Background image URL - section uses this as bg (required) */
  backgroundImage: string;
  /** Optional background area aspect ratio (e.g. "21/9" or 2.33) */
  backgroundAspectRatio?: string | number;
  /** Show the right-side content image */
  showImage?: boolean;
  /** Right-side image URL (when showImage is true) */
  rightImageSrc?: string;
  /** Right-side image alt text */
  rightImageAlt?: string;
  /** Small intro label above title (e.g. "I'm") */
  introduction?: string;
  /** Main title */
  title?: string;
  /** Subtitle below title */
  subtitle?: string;
  /** Description paragraph */
  description?: string;
  /** CTA buttons */
  buttons?: HeroBannerButton[];
  /** Show social icons below description */
  showSocialIcons?: boolean;
  /** Text alignment: "left" or "center" */
  textAlign?: "left" | "center";
  /** Social links (optional) */
  socialLinks?: { facebook?: string; instagram?: string; dribbble?: string };
  className?: string;
  /** Optional extra classes for title only (e.g. theme color overrides) */
  titleClassName?: string;
  /** Override default responsive title sizes (e.g. larger heading on small screens) */
  titleSizeClassName?: string;
}

export default function HeroBannerFull({
  theme = "white",
  backgroundImage,
  backgroundAspectRatio,
  showImage = true,
  rightImageSrc = "/hero.png",
  rightImageAlt = "Hero",
  introduction,
  title,
  subtitle,
  description,
  buttons = [],
  showSocialIcons = false,
  textAlign = "left",
  socialLinks = {},
  className,
  titleClassName,
  titleSizeClassName,
}: HeroBannerFullProps) {
  const isDark = theme === "black";
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const contentClasses = cn(
    "flex flex-col gap-0",
    // "flex flex-col gap-1.5 sm:gap-2.5 lg:gap-3",
    textAlign === "center" ? "items-center text-center" : "items-start text-left"
  );

  const textColor = isDark
    ? "text-gray-900"
    : "text-white";
  const subTextColor = isDark
    ? "text-gray-600"
    : "text-gray-200";
  const introColor = isDark
    ? "text-gray-500"
    : "text-gray-300";

  const primaryBtnClass = "text-white hover:opacity-90";
  const primaryBtnStyle = { backgroundColor: "var(--theme-primary, #8B5E3C)" };
  const secondaryBtnClass = isDark
    ? "bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
    : "bg-white text-gray-900 border border-white hover:bg-gray-100";

  const sectionStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImage})`,
  };

  if (backgroundAspectRatio) {
    sectionStyle.aspectRatio =
      typeof backgroundAspectRatio === "number" ? `${backgroundAspectRatio}` : backgroundAspectRatio;
  }

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative w-full max-w-[100vw] overflow-hidden bg-cover bg-center bg-no-repeat",
        "min-h-[80vh] sm:min-h-[500px] md:min-h-[800px] lg:min-h-[700px] lg:max-h-[90vh] flex items-center",
        className
      )}
      style={sectionStyle}
    >
      {/* Optional overlay for readability when bg image is light */}
      <div
        className={cn(
          "absolute inset-0",
          isDark ? "bg-white/60" : "bg-black/40"
        )}
      />

      <div
        className={cn(
          "relative w-full h-full min-h-[80vh] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center pt-24 pb-20 sm:pt-24 sm:pb-24 md:pt-28 md:pb-28 lg:pt-32 lg:pb-32",
          CONTENT_MAX_WIDTH,
          "mx-auto",
          CONTENT_PADDING
        )}
      >
        <div
          className={cn(
            "grid w-full gap-4 sm:gap-6 lg:gap-10 items-center",
            showImage ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
          )}
        >
          {/* Content – animate up from left (like Scale Operations) */}
          <div
            className={cn(
              "flex flex-col transition-all duration-700 ease-out order-2 lg:order-1",
              showImage ? "lg:col-span-7" : "lg:col-span-12",
              inView ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 translate-y-10 -translate-x-6"
            )}
          >
            <div className={cn(contentClasses, "pb-4 sm:pb-6")}>
              {introduction && (
                <span className={cn("text-sm sm:text-base font-bold", introColor)}>
                  {introduction}
                </span>
              )}
              {title && (
                <h1
                  className={cn(
                    titleSizeClassName ||
                      "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif",
                    textColor,
                    titleClassName
                  )}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={cn("text-sm sm:text-base font-bold", subTextColor)}>
                  {subtitle}
                </p>
              )}
              {description && (
                <p className={cn("text-sm sm:text-base max-w-xl", subTextColor, subtitle ? "mt-2 sm:mt-3" : "")}>
                  {description}
                </p>
              )}
              {showSocialIcons && (
                <div className={cn("flex gap-3", textAlign === "center" ? "justify-center" : "")}>
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={cn("hover:opacity-80", subTextColor)}>
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={cn("hover:opacity-80", subTextColor)}>
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.dribbble && (
                    <a href={socialLinks.dribbble} target="_blank" rel="noopener noreferrer" aria-label="Dribbble" className={cn("hover:opacity-80", subTextColor)}>
                      <DribbbleIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
              {buttons.length > 0 && (
                <div className={cn("flex flex-wrap gap-3 mt-3 mb-4 sm:mt-4 sm:mb-6", textAlign === "center" ? "justify-center" : "")}>
                  {buttons.map((btn, i) => (
                    <Link
                      key={i}
                      to={btn.href}
                      className={cn(
                        "inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium transition-colors",
                        btn.variant === "secondary" ? secondaryBtnClass : primaryBtnClass
                      )}
                      style={btn.variant !== "secondary" ? primaryBtnStyle : undefined}
                    >
                      {btn.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right image – animate up from right (like Scale Operations) */}
          {showImage && (
            <div
              className={cn(
                "flex lg:col-span-5 justify-center items-center transition-all duration-700 ease-out delay-150 order-1 lg:order-2 pt-20 sm:pt-24 md:pt-20",
                // "flex lg:col-span-5 justify-center items-center transition-all duration-700 ease-out delay-150 order-1 lg:order-2 pt-6 sm:pt-8 md:pt-0",
                inView ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 translate-y-10 translate-x-6"
              )}
            >
              <div className="w-full max-w-[260px] sm:max-w-300px md:max-w-[340px] lg:max-w-[480px] aspect-square rounded-lg overflow-hidden shadow-xl shrink-0 animate-hero-float bg-gray-200/40">
                <img
                  src={rightImageSrc}
                  alt={rightImageAlt}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero.png";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
