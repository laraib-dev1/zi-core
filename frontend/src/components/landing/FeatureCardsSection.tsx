import React from "react";
import Container12 from "@/components/layout/Container12";
import FeatureCards from "@/components/ui/FeatureCards";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface FeatureCardsSectionProps {
  className?: string;
}

/** Wraps FeatureCards (Locally Owned, Easy Return, Online Support, Fast Delivery) in 12-col section with inner gap */
export default function FeatureCardsSection({ className }: FeatureCardsSectionProps) {
  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <FeatureCards />
      </Container12>
    </section>
  );
}
