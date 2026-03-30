import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export interface CallToActionSectionProps {
  /** Background image URL – recommended size 1920×1080 (16:9); leave empty to add later */
  backgroundImage?: string;
  /** Play icon click link (optional) */
  playHref?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}

const DEFAULT_DESCRIPTION =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export default function CallToActionSection({
  backgroundImage,
  playHref = "#",
  heading = "Call To Action",
  description = DEFAULT_DESCRIPTION,
  buttonText = "Call To Action",
  buttonHref = "#",
  className,
}: CallToActionSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <Container12 grid gap="gap-0">
        {/* CTA block: 12 cols, BG + content */}
        <div className="col-span-12 relative flex flex-col items-center justify-center overflow-hidden min-h-[320px] md:min-h-[380px] rounded-xl">
          {/* Background: use 1920×1080 image for best result */}
          <div
            className="absolute inset-0 bg-gray-800 rounded-xl"
            style={
              backgroundImage
                ? {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          {!backgroundImage && (
            <div className="absolute inset-0 bg-gray-700 rounded-xl" aria-hidden />
          )}
          <div className="absolute inset-0 bg-black/50 rounded-xl" aria-hidden />

          {/* Content – minimal top/bottom padding with clearer spacing */}
          <div className="relative z-10 flex flex-col items-center text-center w-full p-4 sm:p-5 md:p-6">
            {/* Play button intentionally commented out for now */}
            {/*
            <div className="pt-2" />
            <Link
              to={playHref}
              className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{ backgroundColor: "var(--theme-primary, #0d9488)" }}
              aria-label="Play"
            >
              <Play className="w-7 h-7 md:w-8 md:h-8 text-white fill-white ml-0.5" />
            </Link>
            */}
            <h2 className="mt-2 sm:mt-2 md:mt-3 text-lg sm:text-xl md:text-2xl font-semibold text-white">
              {heading}
            </h2>
            <p className="mt-2 text-sm text-white/90 max-w-2xl mx-auto">
              {description}
            </p>
            <Link
              to={buttonHref}
              className="mt-4 inline-block px-6 py-2.5 rounded-lg border-2 border-white text-white font-medium text-sm hover:bg-white/10 transition-colors"
            >
              {buttonText}
            </Link>
            <div className="pb-2" />
          </div>
        </div>
      </Container12>
    </section>
  );
}
