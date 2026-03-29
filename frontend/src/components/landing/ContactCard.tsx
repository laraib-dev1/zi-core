import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  detail: string;
  /** Optional link - when set, detail becomes clickable and opens in new tab */
  href?: string;
  className?: string;
}

export default function ContactCard({ icon: Icon, title, detail, href, className }: ContactCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white border border-gray-200",
        className
      )}
    >
      <div
        className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary, #8B5E3C) 15%, transparent)", color: "var(--theme-primary, #8B5E3C)" }}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{title}</h3>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-gray-600 break-words hover:underline"
          >
            {detail}
          </a>
        ) : (
          <p className="text-xs sm:text-sm text-gray-600 break-words">{detail}</p>
        )}
      </div>
    </div>
  );
}
