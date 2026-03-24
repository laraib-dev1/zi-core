import React from "react";
import type { LucideIcon } from "lucide-react";
import Container12 from "@/components/layout/Container12";
import FeatureServiceCard from "@/components/ui/FeatureServiceCard";
import { cn } from "@/lib/utils";

export interface FeatureServiceItem {
  title: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  badge?: string;
  icon?: LucideIcon;
}

export interface FeatureServiceCardSectionProps {
  /** Single card or list; each item spans 12 cols (one per row) or use grid for multiple */
  items?: FeatureServiceItem[];
  className?: string;
}

const DEFAULT_ITEMS: FeatureServiceItem[] = [
  {
    title: "Rapid Implementation",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    ctaText: "Discover How",
    ctaHref: "#",
    badge: "TOP RATED",
  },
];

export default function FeatureServiceCardSection({
  items = DEFAULT_ITEMS,
  className,
}: FeatureServiceCardSectionProps) {
  return (
    <section className={cn("w-full py-8 md:py-10", className)}>
      <Container12 grid gap="gap-6">
        {items.map((item, i) => (
          <div key={i} className="col-span-12">
            <FeatureServiceCard
              title={item.title}
              description={item.description}
              ctaText={item.ctaText}
              ctaHref={item.ctaHref}
              badge={item.badge}
              icon={item.icon}
            />
          </div>
        ))}
      </Container12>
    </section>
  );
}
