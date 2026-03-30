import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface LimitedOfferBannerProps {
  title?: string;
  description?: string;
  /** Target date for countdown (default: 30 days from now) */
  targetDate?: Date;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

const DEFAULT_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit.";

export default function LimitedOfferBanner({
  title = "Limited Time Offer",
  description = DEFAULT_DESCRIPTION,
  targetDate,
  buttonText = "Claim Offer",
  buttonHref = "#",
  className,
}: LimitedOfferBannerProps) {
  const target = useMemo(() => {
    if (targetDate) return targetDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
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
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINUTES" },
  ];

  return (
    <section className={cn("w-full", className)}>
      <div className="w-full max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div
          className={cn(
            "w-full rounded-2xl text-white p-4 sm:p-6 md:p-8 relative overflow-hidden",
            "flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 md:gap-8"
          )}
          style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
        >
          {/* Subtle decorative circle top-right */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", transform: "translate(30%, -30%)" }}
            aria-hidden
          />

          {/* Left: heading + description */}
          <div className="relative z-10 flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 text-white">{title}</h2>
            <p className="text-sm sm:text-base text-white/90 max-w-xl">{description}</p>
          </div>

          {/* Right: countdown + button */}
          <div className="relative z-10 flex flex-col items-center md:items-end gap-4 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              {units.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-tight">
                    {value}
                  </span>
                  <span className="text-xs sm:text-sm text-white/95 uppercase tracking-wider mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to={buttonHref}
              className="inline-block px-6 py-3 rounded-lg bg-white text-gray-800 font-medium text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
