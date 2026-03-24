import React from "react";
import Container12 from "@/components/layout/Container12";
import HeadingDivider from "@/components/ui/HeadingDivider";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface TextImageSectionProps {
  title: string;
  description: string;
  bullets?: string[];
  imageSrc?: string;
  /** When "left", image is on the left (cols 1-5); when "right", image is on the right (cols 8-12) */
  imagePosition?: "left" | "right";
  className?: string;
}

export default function TextImageSection({
  title,
  description,
  bullets = [],
  imageSrc = "/hero.png",
  imagePosition = "right",
  className,
}: TextImageSectionProps) {
  const textCol = "col-span-12 lg:col-span-7";
  const imageCol = "col-span-12 lg:col-span-5";
  const orderText = imagePosition === "left" ? "lg:order-2" : "lg:order-1";
  const orderImage = imagePosition === "left" ? "lg:order-1" : "lg:order-2";

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 grid gap="gap-6 sm:gap-8" className={spacing.inner.gap}>
        <div className={cn(textCol, orderText)}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            {title}
          </h2>
          {/* <HeadingDivider className="mt-2 mb-3 sm:mb-4 max-w-xs" /> */}
          <p className="text-gray-700 text-sm sm:text-base mb-4">{description}</p>
          {bullets.length > 0 && (
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {bullets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className={cn(imageCol, orderImage)}>
          <div className="w-full aspect-3/2 rounded-lg overflow-hidden bg-transparent flex items-center justify-center">
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
      </Container12>
    </section>
  );
}
