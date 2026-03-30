import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";
import { Check, Zap, Star } from "lucide-react";

export interface ScaleOperationsBannerProps {
  /** Small tag above heading (e.g. "Transform Your Business") */
  tag?: string;
  heading?: string;
  description?: string;
  /** Bullet points with checkmark */
  features?: string[];
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  /** Trust line (e.g. "Trusted by 500+ companies worldwide") */
  trustText?: string;
  /** Rating: stars + text (e.g. "4.9/5 (2,300+ reviews)") */
  ratingText?: string;
  className?: string;
}

const DEFAULT_FEATURES = [
  "Advanced Analytics Dashboard",
  "24/7 Enterprise Support",
  "Custom Integration Solutions",
];

export default function ScaleOperationsBanner({
  tag = "Transform Your Business",
  heading = "Ready to Scale Your Corporate Operations?",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  features = DEFAULT_FEATURES,
  primaryButtonText = "Start Free Trial",
  primaryButtonHref = "#",
  secondaryButtonText = "Schedule Demo",
  secondaryButtonHref = "#",
  trustText = "Trusted by 500+ companies worldwide",
  ratingText = "4.9/5 (2,300+ reviews)",
  className,
}: ScaleOperationsBannerProps) {
  const themePrimary = "var(--theme-primary, #8B5E3C)";
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    let timer: number | undefined;

    const isMobile = window.innerWidth < 640;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          timer = window.setTimeout(() => {
            setInView(true);
            if (el) observer.unobserve(el);
          }, 300);
        }
      },
      {
        threshold: isMobile ? 0.35 : 0.6,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className={cn("w-full bg-black", className)}>
      <Container12 grid gap="gap-6 sm:gap-8 lg:gap-10" className="py-8 sm:py-10 md:py-12 lg:py-14">
        {/* Left: tag, heading, description – 6 cols on lg – animate up from left */}
        <div
          className={cn(
            "col-span-12 lg:col-span-6 flex flex-col justify-center transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 translate-y-10 -translate-x-6"
          )}
        >
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium w-fit mb-4"
            )}
            style={{
              background: `linear-gradient(135deg, ${themePrimary} 0%, #c2410c 100%)`,
            }}
          >
            <Zap className="w-4 h-4 shrink-0" />
            {tag}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight">
            {heading}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* Right: features, buttons, trust – 6 cols on lg – animate up from right */}
        <div
          className={cn(
            "col-span-12 lg:col-span-6 flex flex-col justify-center transition-all duration-700 ease-out delay-150",
            inView ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 translate-y-10 translate-x-6"
          )}
        >
          <ul className="space-y-3">
            {features.map((text) => (
              <li key={text} className="flex items-center gap-3 text-white">
                <Check className="w-5 h-5 shrink-0 text-green-500" />
                <span className="text-sm sm:text-base">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to={primaryButtonHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white text-sm sm:text-base hover:opacity-90 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${themePrimary} 0%, #c2410c 100%)`,
              }}
            >
              {primaryButtonText}
            </Link>
            <Link
              to={secondaryButtonHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white border border-gray-600 bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              {secondaryButtonText}
            </Link>
          </div>
          <div className="mt-8 flex flex-col gap-1">
            <p className="text-sm text-gray-400">{trustText}</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-sm text-white">{ratingText}</span>
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
