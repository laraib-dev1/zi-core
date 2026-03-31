import React, { useState, useEffect, useMemo } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export interface ComingSoonSectionProps {
  /** Section heading (same as sectionTitle on other sections, e.g. "Maundy") */
  title?: string;
  /** Section subtitle / tagline (same as sectionSubtitle on other sections) */
  tagline?: string;
  /** Target date for countdown (default: 90 days from now) */
  targetDate?: Date;
  /** Social links: key = platform (twitter, facebook, instagram, linkedin), value = URL */
  socialLinks?: Record<string, string>;
  className?: string;
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function ComingSoonSection({
  title = "Maundy",
  tagline = "We are still working on our website. Stay tuned for updates!",
  targetDate,
  socialLinks = {},
  className,
}: ComingSoonSectionProps) {
  const target = useMemo(() => {
    if (targetDate) return targetDate;
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  const socialItems = [
    { key: "twitter", Icon: XIcon, href: socialLinks.twitter || socialLinks.x || "#" },
    { key: "facebook", Icon: Facebook, href: socialLinks.facebook || "#" },
    { key: "instagram", Icon: Instagram, href: socialLinks.instagram || "#" },
    { key: "linkedin", Icon: Linkedin, href: socialLinks.linkedin || "#" },
  ];

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden rounded-none",
        "bg-linear-to-b from-[#7b9cb5] via-[#6b8aa3] to-[#5a7a92]",
        "py-20 sm:py-24 md:py-28 lg:py-32",
        "flex flex-col items-center justify-center text-center",
        "px-6 sm:px-8",
        className
      )}
    >
      {/* Mountain silhouettes - layered, subtle */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg
          className="absolute bottom-0 left-0 w-full h-2/5 opacity-20"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,200 L0,120 Q100,80 200,120 L400,60 Q500,40 600,80 L800,40 L800,200 Z" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-1/3 opacity-15"
          viewBox="0 0 800 180"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,180 L0,100 Q150,60 300,100 L500,70 Q650,50 800,90 L800,180 Z" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-1/4 opacity-10"
          viewBox="0 0 800 160"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,160 L100,100 L250,130 L450,80 L600,110 L800,70 L800,160 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-0 max-w-2xl mx-auto pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20">
        <div className="w-full mb-2">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={!!tagline}
            miniInfo={tagline ?? ""}
            showDividerLine={true}
            align="left"
            variant="dark"
          />
        </div>

        {/* Countdown cards - no extra space before/after */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
          {units.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-white/90 bg-white/10 backdrop-blur-sm py-4 sm:py-5 px-2 min-h-[80px] sm:min-h-[90px]"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                {value}
              </span>
              <span className="text-xs sm:text-sm font-light text-white/95 mt-1 uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Social icons - white circles with dark icons */}
        <div className="flex items-center justify-center gap-4 shrink-0 mt-6">
          {socialItems.map(({ key, Icon, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7D7D7D]/50 text-white hover:bg-[#7D7D7D]/65 hover:scale-105 transition-transform"
              aria-label={key}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
