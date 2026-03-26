import React from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface FeatureBlock {
  /** Image URL – you add the image yourself; placeholder shown if empty */
  imageSrc?: string;
  imageAlt?: string;
  heading: string;
  /** First paragraph */
  paragraph: string;
  /** Optional second paragraph (used in second block) */
  paragraph2?: string;
  /** Optional bullet points with checkmark */
  bullets?: string[];
}

export interface FeaturesDetailsSectionProps {
  title?: string;
  description?: string;
  /** First block: image left, content right */
  feature1: FeatureBlock;
  /** Second block: content left, image right */
  feature2: FeatureBlock;
  className?: string;
}

const DEFAULT_DESCRIPTION =
  "Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit";

export default function FeaturesDetailsSection({
  title = "Features Details",
  description = DEFAULT_DESCRIPTION,
  feature1,
  feature2,
  className,
}: FeaturesDetailsSectionProps) {
  return (
    <section className={cn("w-full py-8 sm:py-12 md:py-14", className)}>
      <Container12 className="flex flex-col gap-6 sm:gap-10 md:gap-16">
        <div className="mb-3 sm:mb-8 md:mb-10">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={description}
            showDividerLine={true}
            align="left"
          />
        </div>

        {/* Block 1: Image left, content right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md aspect-3/2 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {feature1.imageSrc ? (
                <img
                  src={feature1.imageSrc}
                  alt={feature1.imageAlt ?? "Feature illustration"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                  aria-hidden
                >
                  Image placeholder
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {feature1.heading}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {feature1.paragraph}
            </p>
            {feature1.bullets && feature1.bullets.length > 0 && (
              <ul className="space-y-2">
                {feature1.bullets.map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                    <Check
                      className="shrink-0 mt-0.5 w-5 h-5"
                      style={{ color: "var(--theme-primary, #8B5E3C)" }}
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Block 2: Content left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {feature2.heading}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              {feature2.paragraph}
            </p>
            {feature2.paragraph2 && (
              <p className="text-sm sm:text-base text-gray-600">
                {feature2.paragraph2}
              </p>
            )}
            {feature2.bullets && feature2.bullets.length > 0 && (
              <ul className="mt-4 space-y-2">
                {feature2.bullets.map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                    <Check
                      className="shrink-0 mt-0.5 w-5 h-5"
                      style={{ color: "var(--theme-primary, #8B5E3C)" }}
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-start order-1 lg:order-2">
            <div className="w-full max-w-md aspect-3/2 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {feature2.imageSrc ? (
                <img
                  src={feature2.imageSrc}
                  alt={feature2.imageAlt ?? "Feature illustration"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 text-sm"
                  aria-hidden
                >
                  Image placeholder
                </div>
              )}
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
