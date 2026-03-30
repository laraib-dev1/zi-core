import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroBannerBusinessProps {
  /** Main heading (multi-line) */
  heading?: string;
  /** Description paragraph */
  description?: string;
  /** Primary CTA label */
  primaryButtonText?: string;
  primaryButtonHref?: string;
  /** Secondary CTA: "Watch Demo" link */
  watchDemoText?: string;
  watchDemoHref?: string;
  /** Stats row: e.g. [{ value: "500+", label: "Successful Projects" }, ...] */
  stats?: HeroStat[];
  /** Right-side hero image – recommended 1920×1080 */
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

const DEFAULT_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const DEFAULT_STATS: HeroStat[] = [
  { value: "500+", label: "Successful Projects" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "10+", label: "Years Experience" },
];

export default function HeroBannerBusiness({
  heading = "Transform Your Business Vision Into Reality",
  description = DEFAULT_DESCRIPTION,
  primaryButtonText = "Get Started Today",
  primaryButtonHref = "#",
  watchDemoText = "Watch Demo",
  watchDemoHref = "#",
  stats = DEFAULT_STATS,
  imageSrc,
  imageAlt = "Hero",
  className,
}: HeroBannerBusinessProps) {
  return (
    <section className={cn("w-full py-8 sm:py-12 md:py-16 lg:py-20", className)}>
      <Container12 grid gap="gap-8 lg:gap-10">
        {/* Left column: heading, text, CTAs, stats – 6 cols on lg */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight">
            {heading}
          </h1>
          <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={primaryButtonHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-colors"
              style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
            >
              {primaryButtonText}
            </Link>
            <Link
              to={watchDemoHref}
              className="inline-flex items-center gap-2 font-medium hover:underline"
              style={{ color: "var(--theme-primary, #8B5E3C)" }}
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}>
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </span>
              {watchDemoText}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 sm:gap-12">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: image with subtle float animation – 6 cols on lg, 16:9 area */}
        <div className="col-span-12 lg:col-span-6 relative flex items-center justify-center">
          <div
            className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-100 animate-hero-float"
            style={{ aspectRatio: "16/9" }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                aria-hidden
              >
                Hero image (1920×1080)
              </div>
            )}
          </div>
        </div>
      </Container12>
    </section>
  );
}
