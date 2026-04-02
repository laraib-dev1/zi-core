import React from "react";
import Container12 from "@/components/layout/Container12";
import { cn } from "@/lib/utils";

export interface StatItem {
  value: string;
  label: string;
}

export interface ExcellenceSectionProps {
  /** Main heading; use headingUnderline for the part that gets the underline */
  heading?: string;
  /** Text to show with underline (e.g. "Building Excellence"); rest of heading after it (e.g. " Since 1995") */
  headingUnderline?: string;
  /** First paragraph */
  paragraph1?: string;
  /** Second paragraph */
  paragraph2?: string;
  /** Stats: { value, label }[] */
  stats?: StatItem[];
  className?: string;
}

const DEFAULT_PARAGRAPH_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const DEFAULT_PARAGRAPH_2 =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const DEFAULT_STATS: StatItem[] = [
  { value: "25+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "48", label: "Team Members" },
];

export default function ExcellenceSection({
  heading = "Building Excellence Since 1995",
  headingUnderline = "Building Excellence",
  paragraph1 = DEFAULT_PARAGRAPH_1,
  paragraph2 = DEFAULT_PARAGRAPH_2,
  stats = DEFAULT_STATS,
  className,
}: ExcellenceSectionProps) {
  const headingRest = heading.startsWith(headingUnderline)
    ? heading.slice(headingUnderline.length)
    : "";
  const sinceMatch = headingRest.trim().match(/^Since\s+(.+)$/i);
  const sinceYear = sinceMatch ? sinceMatch[1] : "";

  return (
    <section className={cn("w-full py-10 sm:py-12 md:py-14", className)}>
      <Container12 className="flex flex-col gap-4 md:gap-6">
        {/* Heading with underline under first part */}
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-left">
            <span
              className="inline-block border-b-2 pb-1"
              style={{ borderColor: "var(--theme-primary, #8B5E3C)", color: "var(--theme-primary, #8B5E3C)" }}
            >
              {headingUnderline}
            </span>
            {sinceYear ? (
              <>
                <span className="hidden md:inline text-gray-900">{headingRest}</span>
                <span className="md:hidden block text-gray-900 mt-1 max-w-[min(100%,20ch)]">
                  Since{" "}
                  <span className="whitespace-nowrap">{sinceYear}</span>
                </span>
              </>
            ) : (
              <span className="text-gray-900">{headingRest}</span>
            )}
          </h2>
        </div>

        {/* Two paragraphs */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{paragraph1}</p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{paragraph2}</p>
        </div>

        {/* Stat cards - white bg, left accent line */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white rounded-lg pl-4 pr-5 py-5 flex flex-col justify-center border-l-4 min-h-[88px]"
              style={{ borderLeftColor: "var(--theme-primary, #8B5E3C)" }}
            >
              <span
                className="text-xl sm:text-2xl font-bold block mb-1"
                style={{ color: "var(--theme-primary, #8B5E3C)" }}
              >
                {value}
              </span>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </Container12>
    </section>
  );
}
