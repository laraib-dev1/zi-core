import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import { youtubeEmbedSrc } from "@/utils/youtubeEmbed";
import { Play } from "lucide-react";

export interface ZiCorePackageSectionProps {
  /** Optional section chrome (heading above the two columns) */
  sectionTitle?: string;
  sectionSubtitle?: string;
  showSectionHeader?: boolean;
  headingBefore: string;
  headingAccent: string;
  headingAfter: string;
  description: string;
  youtubeUrl: string;
  getStartedLabel: string;
  getStartedHref: string;
  watchDemoLabel: string;
  watchDemoUrl: string;
  className?: string;
}

export default function ZiCorePackageSection({
  sectionTitle = "Zi Core Package",
  sectionSubtitle = "Video and call to action",
  showSectionHeader = false,
  headingBefore,
  headingAccent,
  headingAfter,
  description,
  youtubeUrl,
  getStartedLabel,
  getStartedHref,
  watchDemoLabel,
  watchDemoUrl,
  className,
}: ZiCorePackageSectionProps) {
  const embed = youtubeEmbedSrc(youtubeUrl);
  const embedSrc =
    embed != null
      ? `${embed}${embed.includes("mm8ubTNbsTQ") ? "?si=JuVbp_JerwYI-kno&rel=0" : "?rel=0"}`
      : null;
  const getStartedIsInternal = getStartedHref.trim().startsWith("/");

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        {showSectionHeader && (sectionTitle || sectionSubtitle) && (
          <div className="mb-6 sm:mb-8">
            <SectionHeader
              showBatch={false}
              showHeading={!!sectionTitle}
              heading={sectionTitle}
              cutDividerVariant="withSides"
              showMiniInfo={!!sectionSubtitle}
              miniInfo={sectionSubtitle || ""}
              showCutDivider={false}
              showDividerLine
              align="left"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-gray-200 border border-gray-200 shadow-sm"
            style={{ aspectRatio: "16 / 9" }}
          >
            {embedSrc ? (
              <iframe
                title="YouTube video player"
                src={embedSrc}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500 p-6 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                  aria-hidden
                >
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
                <p className="text-sm">Add a YouTube URL in Sp Builder → Edit for this section.</p>
              </div>
            )}
            {!embedSrc && (
              <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white pointer-events-none">
                16:9
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:gap-5 text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {headingBefore}
              <span className="theme-heading">{headingAccent}</span>
              {headingAfter}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              {getStartedIsInternal ? (
                <Link
                  to={getStartedHref.trim() || "/zi-core-package"}
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  {getStartedLabel}
                </Link>
              ) : (
                <a
                  href={getStartedHref.trim() || "/zi-core-package"}
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  {getStartedLabel}
                </a>
              )}
              <a
                href={watchDemoUrl.trim() || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border-2 px-6 py-3 text-sm font-medium transition-colors border-[var(--theme-primary)] text-[var(--theme-primary)] bg-transparent hover:bg-[var(--theme-primary)] hover:text-white"
              >
                {watchDemoLabel}
              </a>
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
