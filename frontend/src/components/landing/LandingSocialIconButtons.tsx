import React from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickSocialLinksOrDefault } from "@/utils/landingSocial";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/** Same as TeamCard: grey circle, white glyphs at 50% opacity (full on hover). Order: X → Facebook → LinkedIn → Instagram. */
const BTN =
  "flex items-center justify-center rounded-full border border-[#7D7D7D] bg-[#7D7D7D] text-white transition-colors hover:opacity-90";
const ICON = "opacity-50 group-hover:opacity-100 transition-opacity";

export type CompanySocialLinks = {
  twitter?: string;
  x?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

/** Fixed four platforms only (matches second landing / team reference). */
const ITEMS: {
  hrefKey: keyof Pick<CompanySocialLinks, "twitter" | "facebook" | "linkedin" | "instagram">;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { hrefKey: "twitter", Icon: XIcon, label: "X" },
  { hrefKey: "facebook", Icon: Facebook, label: "Facebook" },
  { hrefKey: "linkedin", Icon: Linkedin, label: "LinkedIn" },
  { hrefKey: "instagram", Icon: Instagram, label: "Instagram" },
];

export interface LandingSocialIconButtonsProps {
  links?: CompanySocialLinks | Record<string, string | undefined> | null;
  /** Navbar uses slightly smaller size; footer/team use default */
  size?: "sm" | "md";
  className?: string;
}

export default function LandingSocialIconButtons({
  links,
  size = "md",
  className,
}: LandingSocialIconButtonsProps) {
  const merged = pickSocialLinksOrDefault(links as Record<string, string | undefined> | null) as CompanySocialLinks;
  const btnSize = size === "sm" ? "w-8 h-8 sm:w-9 sm:h-9" : "w-7 h-7 sm:w-8 sm:h-8";
  const iconSize = size === "sm" ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-3.5 h-3.5 sm:w-4 sm:h-4";

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2.5 sm:gap-4", className)}>
      {ITEMS.map(({ hrefKey, Icon, label }) => {
        const href = merged[hrefKey] ?? (hrefKey === "twitter" ? merged.x : undefined);
        if (!href) return null;
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn("group", BTN, btnSize)}
          >
            <Icon className={cn(iconSize, ICON)} />
          </a>
        );
      })}
    </div>
  );
}
