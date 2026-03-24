import React from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface HowWeWorkBlockItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export interface HowWeWorkBlocksProps {
  title?: string;
  subtitle?: string;
  items: HowWeWorkBlockItem[];
  className?: string;
}

export default function HowWeWorkBlocks({
  title = "How We Work",
  subtitle = "Title info description details",
  items,
  className,
}: HowWeWorkBlocksProps) {
  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-6 sm:mb-8 md:mb-10">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={true}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={subtitle}
            showDividerLine={false}
            align="center"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 sm:p-5 rounded-lg transition-shadow hover:shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shrink-0"
                  style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container12>
    </section>
  );
}
