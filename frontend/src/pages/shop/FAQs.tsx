import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getContentByType } from "@/api/content.api";
import { ChevronDown, ChevronRight } from "lucide-react";
import PageLoader from "@/components/ui/PageLoader";
import { spacing } from "@/utils/spacing";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQContent = {
  faqs?: FAQItem[];
  lastUpdated?: string;
};

export default function FAQs() {
  const [content, setContent] = useState<FAQContent>({
    faqs: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // All collapsed by default

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContentByType("faqs");
        setContent({
          faqs: data.faqs ?? [],
          lastUpdated: data.lastUpdated,
        });
      } catch (err) {
        console.error("Failed to load FAQs", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "15 Nov 2023";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <style>{`
        /* Force text-align from inline styles - override any other rules */
        .content-area p[style*="text-align"],
        .content-area div[style*="text-align"],
        .content-area h1[style*="text-align"],
        .content-area h2[style*="text-align"],
        .content-area h3[style*="text-align"],
        .content-area h4[style*="text-align"],
        .content-area h5[style*="text-align"],
        .content-area h6[style*="text-align"],
        .content-area span[style*="text-align"],
        .content-area [style*="text-align"] {
          text-align: inherit !important;
        }
        .content-area [style*="text-align: center"],
        .content-area [style*="text-align:center"],
        .content-area [style*="text-align: center;"],
        .content-area [style*="text-align:center;"] {
          text-align: center !important;
        }
        .content-area [style*="text-align: right"],
        .content-area [style*="text-align:right"],
        .content-area [style*="text-align: right;"],
        .content-area [style*="text-align:right;"] {
          text-align: right !important;
        }
        .content-area [style*="text-align: justify"],
        .content-area [style*="text-align:justify"],
        .content-area [style*="text-align: justify;"],
        .content-area [style*="text-align:justify;"] {
          text-align: justify !important;
        }
        .content-area [style*="text-align: left"],
        .content-area [style*="text-align:left"],
        .content-area [style*="text-align: left;"],
        .content-area [style*="text-align:left;"] {
          text-align: left !important;
        }
      `}</style>
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1`}>
        {/* Title Section - Centered content area */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold theme-heading mb-4 text-center">
                Frequently Asked Questions
              </h1>
              
              {/* Subtitle – section inner gap between subinfo and line */}
              <p className={`text-lg text-gray-600 text-center ${spacing.inner.gapBottom}`}>
                Find answers to common questions
              </p>
              
              {/* Horizontal Line */}
              <div className="w-full border-t border-gray-300" style={{ marginTop: 0, marginBottom: 0 }}></div>
            </div>
          </div>
        </section>

        {/* Content Section - Centered */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              {/* FAQs List */}
              <div className="space-y-3">
                {content.faqs && content.faqs.length > 0 ? (
                  content.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Question Header */}
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                      >
                        <span className="text-base font-semibold text-gray-900 pr-4">
                          {faq.question || "Question Here Lorem ipsum dolor sit amet."}
                        </span>
                        {expandedIndex === index ? (
                          <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                        )}
                      </button>

                      {/* Answer Content */}
                      {expandedIndex === index && (
                        <div className="px-4 pb-4 pt-0">
                          <div
                            className="prose prose-sm max-w-none text-gray-700 text-sm content-area"
                            dangerouslySetInnerHTML={{ __html: faq.answer || "<p>No answer available.</p>" }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No FAQs available yet. Please check back later.
                  </p>
                )}
              </div>

              {/* Last Updated - Bottom Right */}
              {content.lastUpdated && (
                <div className="text-right text-sm text-gray-500 mt-4 mb-0">
                  Updated: {formatDate(content.lastUpdated)}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0, position: 'relative', zIndex: 10 }}>
        <Footer />
      </section>
    </div>
  );
}

