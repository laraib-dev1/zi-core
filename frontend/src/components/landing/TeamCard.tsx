import React from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export interface TeamCardSocialLink {
  platform: "twitter" | "facebook" | "linkedin" | "instagram";
  href: string;
}

export interface TeamCardProps {
  /** Portrait image URL */
  imageSrc: string;
  imageAlt?: string;
  name: string;
  title?: string;
  description?: string;
  /** Social links; order: twitter, facebook, linkedin, instagram */
  socialLinks?: TeamCardSocialLink[] | Record<string, string>;
  className?: string;
}

const SOCIAL_ICONS = [
  { key: "twitter", Icon: XIcon },
  { key: "facebook", Icon: Facebook },
  { key: "linkedin", Icon: Linkedin },
  { key: "instagram", Icon: Instagram },
] as const;

function getSocialHref(links: TeamCardProps["socialLinks"], key: string): string {
  if (!links) return "#";
  if (Array.isArray(links)) {
    const item = links.find((l) => l.platform === key);
    return item?.href ?? "#";
  }
  return links[key] ?? links.x ?? "#";
}

export default function TeamCard({
  imageSrc,
  imageAlt,
  name,
  title = "",
  description = "",
  socialLinks,
  className,
}: TeamCardProps) {
  return (
    <article
      className={cn(
        "w-full rounded-xl overflow-hidden bg-white shadow-md",
        "flex flex-col",
        className
      )}
    >
      {/* Top: portrait image, 1:1 ratio, rounded top */}
      <div className="relative w-full aspect-square shrink-0 overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={imageSrc}
          alt={imageAlt ?? name}
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Bottom: name, title, description, separator, social icons */}
      <div className="flex flex-col flex-1 px-1 py-1 sm:px-3 sm:py-3 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{name}</h3>
        {title && (
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: "var(--theme-primary, #0d9488)" }}
          >
            {title}
          </p>
        )}
        {description && (
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
        )}

        <hr className="mt-3 border-gray-200 w-full" />

        <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2.5 sm:gap-4">
          {SOCIAL_ICONS.map(({ key, Icon }) => {
            const href = getSocialHref(socialLinks, key);
            if (!href) return null;
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#7D7D7D]/50 bg-[#7D7D7D]/50 text-white flex items-center justify-center hover:bg-[#7D7D7D]/65 hover:border-[#7D7D7D]/65 transition-colors"
                aria-label={key}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
}
