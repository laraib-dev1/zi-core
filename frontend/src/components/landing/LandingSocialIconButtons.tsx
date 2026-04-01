import React from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickSocialLinksOrDefault } from "@/utils/landingSocial";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/** Same as TeamCard: 50% icon background opacity, full icon text color. Order: X → Facebook → LinkedIn → Instagram. */
const BTN =
  "flex items-center justify-center rounded-full border border-[#7D7D7D]/50 bg-[#7D7D7D]/50 text-white transition-colors hover:bg-[#7D7D7D]/65 hover:border-[#7D7D7D]/65";
const ICON = "";

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
  /** When false, do not inject default social links. */
  useDefaults?: boolean;
  className?: string;
}

export default function LandingSocialIconButtons({
  links,
  size = "md",
  useDefaults = true,
  className,
}: LandingSocialIconButtonsProps) {
  const merged = useDefaults
    ? (pickSocialLinksOrDefault(links as Record<string, string | undefined> | null) as CompanySocialLinks)
    : ((links || {}) as CompanySocialLinks);
  const btnSize = size === "sm" ? "w-7 h-7 sm:w-8 sm:h-8" : "w-7 h-7 sm:w-8 sm:h-8";
  const iconSize = size === "sm" ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-3.5 h-3.5 sm:w-4 sm:h-4";

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1 sm:gap-2", className)}>
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
