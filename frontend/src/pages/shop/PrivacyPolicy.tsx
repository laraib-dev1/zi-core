import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getContentByType } from "@/api/content.api";
import { TableOfContents } from "@/components/ui/TableOfContents";
import PageLoader from "@/components/ui/PageLoader";
import { spacing } from "@/utils/spacing";

type PageContent = {
  title: string;
  subTitle: string;
  description: string;
  lastUpdated?: string;
};

export default function PrivacyPolicy() {
  const [content, setContent] = useState<PageContent>({
    title: "Privacy Policy",
    subTitle: "Legal page related Sub Title",
    description: "",
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContentByType("privacy");
        setContent(data);
      } catch (err) {
        console.error("Failed to load privacy policy", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Preserve alignment styles after content loads
  useEffect(() => {
    if (contentRef.current && content.description) {
      const elements = contentRef.current.querySelectorAll('[style*="text-align"]');
      elements.forEach((el) => {
        const style = el.getAttribute('style');
        if (style) {
          const match = style.match(/text-align:\s*(center|right|justify|left)/i);
          if (match) {
            (el as HTMLElement).style.textAlign = match[1] as any;
          }
        }
      });
    }
  }, [content.description]);

  if (loading) return <PageLoader />;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "15 Nov 2023";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-white min-h-screen flex flex-col" data-toc-sticky-page>
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
                {content.title || "Privacy Policy"}
              </h1>
              
              {/* Subtitle – section inner gap between subinfo and line */}
              <p className={`text-lg text-gray-600 text-center ${spacing.inner.gapBottom}`}>
                {content.subTitle || "Legal page related Sub Title"}
              </p>
              
              {/* Horizontal Line */}
              <div className="w-full border-t border-gray-300" style={{ marginTop: 0, marginBottom: 0 }}></div>
            </div>
          </div>
        </section>

        {/* Content Section - Centered with TOC */}
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                {/* Table of Contents - Left Sidebar (sticky, sath sath dikhe) */}
                <div className="lg:w-64 lg:shrink-0 lg:self-start">
                  <TableOfContents htmlContent={content.description} contentRef={contentRef} />
                </div>

                {/* Main Content - Centered content area */}
                <div className="flex-1">
                  {/* Content */}
                  <div 
                    ref={contentRef}
                    className="prose prose-lg max-w-none text-gray-700 mb-0 relative content-area"
                    dangerouslySetInnerHTML={{ __html: content.description || "<p>No content available yet.</p>" }}
                  />

                  {/* Last Updated - Bottom Right */}
                  <div className="text-right text-sm text-gray-500 mt-4 mb-0">
                    Updated: {formatDate(content.lastUpdated)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
    </div>
  );
}

