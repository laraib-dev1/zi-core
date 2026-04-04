import React from "react";
import { Link } from "react-router-dom";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cnTabsTriggerUnderline } from "@/components/ui/tabTriggerVariants";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";
import LandingSocialIconButtons from "@/components/landing/LandingSocialIconButtons";

export interface PortfolioDetailSectionProps {
  /** Optional section heading above content (e.g. "About me") */
  sectionTitle?: string;
  /** Optional section subtitle */
  sectionSubtitle?: string;
  title?: string;
  tagline?: string;
  description?: string;
  descriptionHtml?: string;
  /** Button labels and hrefs: e.g. [{ label: "My Portfolio", href: "#" }] */
  buttons?: Array<{ label: string; href: string }>;
  images?: string[];
  /** Tab content for Description */
  tabDescription?: string;
  /** Optional demo video URL (YouTube watch or embed) */
  demoVideoUrl?: string;
  /** Company panel social URLs — same four icons as navbar/footer/team (X, Facebook, LinkedIn, Instagram). */
  companySocialLinks?: Record<string, string | undefined> | null;
  className?: string;
}

const defaultButtons = [
  { label: "My Portfolio", href: "#" },
  { label: "My Projects", href: "#" },
  // { label: "My Services", href: "#" },
  // { label: "Schedule Meeting", href: "#" },
];

const defaultDescription = `I am Dr. Ali Athar, a board-certified general surgeon and medical photographer. With years of experience in the operating room, I combine precision, discipline, and artistry to capture not only the science but also the human side of surgery.

Through both the scalpel and the camera lens, I carefully document procedures, highlight surgical techniques, and preserve the intricate details that make each operation unique. My work aims to educate medical professionals, inspire students, and provide a deeper understanding of the skill, dedication, and artistry involved in modern surgical practice.

Beyond the operating room, I explore the intersection of medicine and visual storytelling, creating a portfolio that reflects both technical expertise and the human experience in healthcare.`;

const defaultTabDescription = `My work merges medicine with visual storytelling. Every photograph and surgical case captures the intricacies of human anatomy, the precision of surgical techniques, and the care behind every procedure. By sharing these experiences, I aim to educate medical professionals, inspire students, and give the public a glimpse into the discipline and artistry of modern surgery.

From complex procedures to detailed surgical photography, this platform reflects my commitment to excellence, education, and the human side of medicine.`;

export default function PortfolioDetailSection({
  sectionTitle,
  sectionSubtitle,
  title = "Portfolio Title we took the next level",
  tagline = "User Role or Tag Line",
  description = defaultDescription,
  buttons = defaultButtons,
  images = ["/hero.png", "/hero.png", "/hero.png", "/hero.png"],
  tabDescription = defaultTabDescription,
  demoVideoUrl,
  companySocialLinks,
  className,
}: PortfolioDetailSectionProps) {
  const accentColor = "var(--theme-primary, #8B5E3C)";

  return (
    <section className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        {sectionTitle && (
          <div className="mb-6 sm:mb-8 md:mb-10">
            <SectionHeader
              showBatch={false}
              showHeading={true}
              heading={sectionTitle}
              showCutDivider={false}
              cutDividerVariant="withSides"
              showMiniInfo={!!sectionSubtitle}
              miniInfo={sectionSubtitle ?? ""}
              showDividerLine={true}
              align="left"
            />
          </div>
        )}
        {/* Top: Image gallery (5 cols) + Info (7 cols) — 12 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3 items-start">
          <div className="lg:col-span-5 flex justify-start">
            <ProductImageGallery images={images} showThumbnails={false} />
          </div>
          <div className="lg:col-span-7 flex flex-col"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <div className="space-y-1">
              <p className="text-base font-medium" style={{ color: accentColor }}>
                {tagline}
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {buttons.map((btn, i) => (
                <Link
                  key={i}
                  to={btn.href}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-white font-medium text-xs sm:text-sm transition-colors whitespace-nowrap hover:opacity-90"
                  style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
                >
                  {btn.label}
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">Stay connected for updates, insights, and medical photography highlights from my surgical journey.</p>
              <LandingSocialIconButtons links={companySocialLinks} className="justify-start" />
            </div>
          </div>
        </div>

        {/* Bottom: Tabs — full 12 cols */}
        <div className="mt-8">
          <Tabs defaultValue="description">
            <div className="w-full">
              <TabsList className="flex gap-0.5 p-0 h-10 w-fit min-w-0 border-0 bg-transparent items-stretch mb-2">
              <TabsTrigger value="description" className={cnTabsTriggerUnderline()}>
                Description
              </TabsTrigger>
              {/* <TabsTrigger
                value="demo-video"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:scale-100 -mb-px transition-colors border-0 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,#e5e7eb)] data-[state=active]:hover:bg-[var(--theme-primary)]"
              >
                Demo Video
              </TabsTrigger> */}
            </TabsList>
              <div className="h-0 w-full border-b-2 border-gray-100" aria-hidden />
            </div>
            <TabsContent value="description" className="mt-4">
              <div
                className="rounded-xl p-4 sm:p-6 text-gray-700 text-sm sm:text-base leading-relaxed"
                style={{
                  backgroundColor: "#FDFBF8",
                  border: "1px solid #E5E5E5",
                }}
              >
                {tabDescription}
              </div>
            </TabsContent>
            {/* <TabsContent value="demo-video" className="mt-4">
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  backgroundColor: "#FDFBF8",
                  border: "1px solid #E5E5E5",
                }}
              >
                {demoVideoUrl ? (
                  <iframe
                    className="w-full aspect-video rounded-lg"
                    src={demoVideoUrl.replace("watch?v=", "embed/")}
                    allowFullScreen
                    title="Demo video"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                    Demo video placeholder
                  </div>
                )}
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </Container12>
    </section>
  );
}
