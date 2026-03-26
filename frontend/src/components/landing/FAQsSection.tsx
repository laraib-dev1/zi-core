import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQsSectionProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  /** Index of item to expand by default (0 = first). Use null for all collapsed */
  defaultExpandedIndex?: number | null;
  className?: string;
}

const defaultItems: FAQItem[] = [
  {
    question: "How do I list my business for sale?",
    answer:
      "To list your business, create an account on our platform, fill out the required business details and submit your listing for approval. Once approved, your business will be visible to potential buyers.",
  },
  {
    question: "Question here Lorem ipsum dolor sit amet.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    question: "Question here Lorem ipsum dolor sit amet.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    question: "Question here Lorem ipsum dolor sit amet.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    question: "Question here Lorem ipsum dolor sit amet.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    question: "Question here Lorem ipsum dolor sit amet.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export default function FAQsSection({
  title = "FAQs",
  subtitle = "Mini info section details",
  items = defaultItems,
  defaultExpandedIndex = 0,
  className,
}: FAQsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    defaultExpandedIndex
  );

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        <div className="mb-6 sm:mb-8 md:mb-10">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={subtitle}
            showDividerLine={true}
            align="left"
          />
        </div>

        <div className="space-y-3 w-full">
          {items.map((item, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg border border-gray-200 bg-gray-50 overflow-hidden transition-shadow hover:shadow-sm"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className={cn(
                    "w-full flex items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5 text-left transition-colors",
                    isExpanded ? "bg-gray-100" : "hover:bg-gray-100/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex-1 text-sm sm:text-base",
                      isExpanded ? "font-semibold text-gray-900" : "font-medium text-gray-800"
                    )}
                  >
                    {item.question}
                  </span>
                  <span
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200"
                    style={{ color: "var(--theme-primary, #8B5E3C)" }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container12>
    </section>
  );
}
