import React, { useState } from "react";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";

export interface ClientLogoItem {
  /** Logo image URL */
  imageUrl: string;
  /** Alt text for image */
  alt?: string;
}

/** One "slide" of logos (e.g. 4 logos). Indicators switch between slides. */
export interface ClientsSectionProps {
  title?: string;
  description?: string;
  /** Each slide is an array of logo items (imageUrl, alt). Dots control which slide is visible. */
  slides?: ClientLogoItem[][];
  /** Logo image height (width auto, object-contain) */
  logoHeight?: number;
  className?: string;
}

/** Placeholder 1x1 transparent pixel so section renders until you pass real logo URLs */
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'/%3E";

const GOOGLE_LOGO = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png";
const MICROSOFT_LOGO = "https://img.icons8.com/color/96/microsoft.png";
const META_LOGO = "https://img.icons8.com/color/96/facebook-new.png";
const SLACK_LOGO = "https://img.icons8.com/color/96/slack-new.png";
const SPOTIFY_LOGO = "https://img.icons8.com/color/96/spotify--v1.png";
const ADOBE_LOGO = "https://img.icons8.com/color/96/adobe-creative-cloud.png";
const NETFLIX_LOGO = "https://img.icons8.com/color/96/netflix-desktop-app.png";
const AIRBNB_LOGO = "https://img.icons8.com/color/96/airbnb.png";

const DEFAULT_SLIDES: ClientLogoItem[][] = [
  [
    { imageUrl: GOOGLE_LOGO, alt: "Google" },
    { imageUrl: MICROSOFT_LOGO, alt: "Microsoft" },
    { imageUrl: META_LOGO, alt: "Meta" },
    { imageUrl: SLACK_LOGO, alt: "Slack" },
  ],
  [
    { imageUrl: SPOTIFY_LOGO, alt: "Spotify" },
    { imageUrl: ADOBE_LOGO, alt: "Adobe" },
    { imageUrl: NETFLIX_LOGO, alt: "Netflix" },
    { imageUrl: AIRBNB_LOGO, alt: "Airbnb" },
  ],
  [
    { imageUrl: PLACEHOLDER_IMG, alt: "Trustly" },
    { imageUrl: PLACEHOLDER_IMG, alt: "oldendorff" },
    { imageUrl: PLACEHOLDER_IMG, alt: "Lilly" },
    { imageUrl: PLACEHOLDER_IMG, alt: "myob" },
  ],
  [
    { imageUrl: PLACEHOLDER_IMG, alt: "Client A" },
    { imageUrl: PLACEHOLDER_IMG, alt: "Client B" },
    { imageUrl: PLACEHOLDER_IMG, alt: "Client C" },
    { imageUrl: PLACEHOLDER_IMG, alt: "Client D" },
  ],
];

export default function ClientsSection({
  title = "Clients",
  description = "Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit",
  slides = DEFAULT_SLIDES,
  logoHeight = 40,
  className,
}: ClientsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;
  const currentSlide = slides[activeIndex] ?? [];

  return (
    <section
      className={cn("w-full theme-bg-accent", className)}
    >
      <Container12 className="flex flex-col items-center gap-2 pt-6 pb-6">
        {/* Title + underline - padding before heading via container pt */}
        <div className="w-full flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <div
            className="mt-2 h-0.5 w-12 rounded-full"
            style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
          />
        </div>

        {/* Description - tight to logo row */}
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl">
          {description}
        </p>

        {/* Logo row with breathing room top/bottom */}
        <div className="w-full flex items-center justify-center flex-nowrap gap-0 py-3 sm:py-4">
          {currentSlide.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-center shrink-0 overflow-hidden"
              style={{ height: logoHeight, aspectRatio: "3/2" }}
            >
              <img
                src={item.imageUrl}
                alt={item.alt ?? "Client logo"}
                className="w-full h-full object-contain object-center"
                style={{ maxHeight: logoHeight }}
              />
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        {slideCount > 1 && (
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  i === activeIndex ? "" : "bg-gray-300 hover:bg-gray-400"
                )}
                style={
                  i === activeIndex
                    ? { backgroundColor: "var(--theme-primary, #8B5E3C)" }
                    : undefined
                }
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </Container12>
    </section>
  );
}
