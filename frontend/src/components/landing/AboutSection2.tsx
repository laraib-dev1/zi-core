import React from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface AboutSection2Props {
  sectionTitle?: string;
  sectionSubtitle?: string;
  title: string;
  description: string;
  bullets?: string[];
  stats?: Array<{ value: string; label: string }>;
  imageSrc?: string;
  className?: string;
}

const defaultStats = [
  { value: "500+", label: "SERVER CLIENTS" },
  { value: "500+", label: "SERVER CLIENTS" },
  { value: "500+", label: "SERVER CLIENTS" },
  { value: "500+", label: "SERVER CLIENTS" },
  { value: "500+", label: "SERVER CLIENTS" },
];

export default function AboutSection2({
  sectionTitle = "About us",
  sectionSubtitle = "Title info description details",
  title,
  description,
  bullets = [],
  stats = defaultStats,
  imageSrc = "/hero.png",
  className,
}: AboutSection2Props) {
  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-6 sm:mb-8 md:mb-10">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={sectionTitle}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={sectionSubtitle}
            showDividerLine={true}
            align="left"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left: text + stats — ~7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {title}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">{description}</p>
            {bullets.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--theme-primary, #8B5E3C)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: image — ~5 cols */}
          <div className="lg:col-span-5">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-transparent flex items-center justify-center">
              <img
                src={imageSrc}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero.png";
                }}
              />
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
