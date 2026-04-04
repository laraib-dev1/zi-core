import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar2 from "@/components/layout/Navbar2";
import { getEnabledLandingSections, getLandingSections } from "@/api/landingsection.api";
import { getBanners2 } from "@/api/banner2.api";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import Footer from "@/components/layout/Footer";
import { spacing } from "@/utils/spacing";
import HeroBannerFull from "@/components/landing/HeroBannerFull";
import CtaBanner from "@/components/landing/CtaBanner";
import TextImageSection from "@/components/landing/TextImageSection";
import HowWeWorkBlocks from "@/components/landing/HowWeWorkBlocks";
import PortfolioDetailSection from "@/components/landing/PortfolioDetailSection";
import PortfolioGridSection from "@/components/landing/PortfolioGridSection";
import FeatureCardsSection from "@/components/landing/FeatureCardsSection";
import DetailWithLeftSidebar from "@/components/landing/DetailWithLeftSidebar";
import HelpBanner from "@/components/landing/HelpBanner";
import ExcellenceSection from "@/components/landing/ExcellenceSection";
import ScaleOperationsBanner from "@/components/landing/ScaleOperationsBanner";
import FeatureServiceCardSection from "@/components/landing/FeatureServiceCardSection";
import HeroBannerBusiness from "@/components/landing/HeroBannerBusiness";
import TeamSection from "@/components/landing/TeamSection";
import UnlockPotentialSection from "@/components/landing/UnlockPotentialSection";
import CallToActionSection from "@/components/landing/CallToActionSection";
import FeaturesDetailsSection from "@/components/landing/FeaturesDetailsSection";
import ClientsSection from "@/components/landing/ClientsSection";
import LimitedOfferBanner from "@/components/landing/LimitedOfferBanner";
import EventBanner from "@/components/landing/EventBanner";
import ContactSection from "@/components/landing/ContactSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ServicesSection from "@/components/landing/ServicesSection";
import CoursesSection from "@/components/landing/CoursesSection";
import FAQsSection from "@/components/landing/FAQsSection";
import ComingSoonSection from "@/components/landing/ComingSoonSection";
import CatalogSection from "@/components/landing/CatalogSection";
import ApplicationsSection from "@/components/landing/ApplicationsSection";
import ZiCorePackageSection from "@/components/landing/ZiCorePackageSection";
import { isCatalogStyleLandingSectionId } from "@/utils/landingSectionCatalog";
import {
  buildSectionContentMapFromList,
  contentOverride,
  SECTION_CONTENT_DEFAULTS,
  parseClientLogoSlidesMultiline,
  parseMultilineStringArray,
  parseStatLinesMultiline,
} from "@/utils/landingSectionContent";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import PageLoader from "@/components/ui/PageLoader";
import { Search, Lightbulb, Settings, Rocket, Package } from "lucide-react";
import { smoothScrollToElement } from "@/lib/utils";
import { getCompany } from "@/api/company.api";
import { getContentByType } from "@/api/content.api";
import type { FAQ } from "@/api/content.api";
import { applyCompanyBranding, buildWhatsAppUrl, DEFAULT_COMPANY_NAME } from "@/utils/companyBrand";
import { buildFilteredMainNavLinks } from "@/utils/landingNavbarLinks";
import { DEFAULT_LANDING_SECTION_ORDER } from "@/utils/defaultLandingSectionOrder";

const myProjectsHtmlContent = `
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<h2>Information We Collect</h2>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
<h2>Data Security</h2>
<p>Pellentesque feugiat lacus vel orci viverra, id tempor nunc blandit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<h2>Third-Party Links</h2>
<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
<h2>Your Rights</h2>
<p>I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now.</p>
<ul>
<li>How about if I sleep a little bit</li>
<li>A collection of textile samples lay spread out</li>
<li>His many legs, pitifully thin compared with</li>
<li>He lay on his armour-like back</li>
<li>Gregor Samsa woke from troubled dreams</li>
</ul>
<h2>Children's Privacy</h2>
<p>When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees.</p>
<h2>Changes to This Policy</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<h2>Contact Us</h2>
<p>For any questions about this policy, please contact us at the address provided on our website.</p>
`;

const howWeWorkItems = [
  { icon: Search, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: Lightbulb, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: Settings, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: Rocket, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: Package, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: Package, label: "Label Here", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

const MAIN_NAV_SCROLL_IDS = new Set([
  "home",
  "about",
  "portfolio",
  "testimonials",
  "applications",
  "other-pages",
  "contact",
]);

type ImgFn = (slot: string) => string;

type HeroCompany = {
  companyName: string;
  slogan?: string;
  description?: string;
  socialLinks?: Record<string, string>;
};

type FaqPageSlice = { title: string; subTitle: string; items: FAQ[]; loaded: boolean };

function createSectionRenderers(
  img: ImgFn,
  company: HeroCompany,
  faqPage: FaqPageSlice,
  workTogetherWhatsAppHref: string,
  contentMap: Record<string, Record<string, string>>
): Record<string, () => React.ReactNode> {
  const ov = (sectionId: string, key: string, fallback: string) =>
    contentOverride(contentMap, sectionId, key, fallback);
  const slogan = company.slogan?.trim();
  const desc = company.description?.trim();
  const textImageBulletsDefault = SECTION_CONTENT_DEFAULTS["text-image"]?.bullets ?? "";
  const scaleOpsFeaturesDefault = SECTION_CONTENT_DEFAULTS["scale-operations"]?.features ?? "";
  const excellenceStatsDefault = SECTION_CONTENT_DEFAULTS.excellence?.statsLines ?? "";
  return {
    hero: () => (
      <div id="home" className="pb-12px sm:pb-5">
        <HeroBannerFull
          theme="white"
          backgroundImage={img("hero-bg") || "/hero.png"}
          backgroundAspectRatio="21/9"
          showImage={true}
          rightImageSrc={img("hero-right") || "/hero.png"}
          rightImageAlt="Hero"
          introduction=""
          title={company.companyName}
          titleClassName="theme-text-primary"
          titleSizeClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif"
          subtitle={slogan || undefined}
          description={desc || undefined}
          buttons={[
            // { label: "View Portfolio", href: "#portfolio", variant: "primary" },
            { label: "View Application", href: "/#applications", variant: "primary" },
            { label: "Contact Me", href: "#contact", variant: "secondary" },
          ]}
          showSocialIcons={false}
          textAlign="left"
        />
      </div>
    ),
    about: () => (
      <div id="about" className={spacing.section.gap}>
        <PortfolioDetailSection
          sectionTitle={ov("about", "sectionTitle", "About me")}
          sectionSubtitle={ov("about", "sectionSubtitle", "FCPS – General Surgeon | Medical Photographer")}
          title={ov("about", "title", "We Take Surgery Beyond the Operating Room")}
          tagline={ov("about", "tagline", "User Role or Tag Line")}
          images={[img("about-1") || "/hero.png", img("about-2") || "/hero.png", img("about-3") || "/hero.png", img("about-4") || "/hero.png"]}
          companySocialLinks={company.socialLinks}
        />
      </div>
    ),
    "cta-banner-1": () => (
      <div id="cta-banner-1" className={spacing.section.gap}>
        <CtaBanner 
        variant="light" 
        title={ov("cta-banner-1", "title", "Discover Surgical Precision & Art")}
        description={ov(
          "cta-banner-1",
          "description",
          "Explore the intersection of medicine and visual storytelling through curated surgical documentation and photography."
        )}
        buttonText={ov("cta-banner-1", "buttonText", "Explore Now")}
        onButtonClick={() => {
        const el = document.getElementById("portfolio");
        if (el) {
          smoothScrollToElement(el, { duration: 1000 }); // adjust duration if needed
        }
      }} />
      </div>
    ),
    "text-image": () => (
      <div id="text-image" className={spacing.section.gap}>
        <TextImageSection
          title={ov("text-image", "title", "Precision Meets Art in Surgery")}
          description={ov(
            "text-image",
            "description",
            "As a board-certified surgeon and medical photographer, I capture the discipline, skill, and human side of surgery. Each procedure is documented to educate, inspire, and showcase the artistry involved in modern surgical practice."
          )}
          bullets={ov("text-image", "bullets", textImageBulletsDefault)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)}
          imagePosition="left"
          imageSrc={img("text-image") || "/hero.png"}
        />
      </div>
    ),
    "how-we-work": () => (
      <div id="how-we-work" className={spacing.section.gap}>
        <HowWeWorkBlocks
          title={ov("how-we-work", "title", "How We Work")}
          subtitle={ov("how-we-work", "subtitle", "Title info description details")}
          items={howWeWorkItems}
        />
      </div>
    ),
    "cta-banner-2": () => (
      <div id="cta-banner-2" className={spacing.section.gap}>
        <CtaBanner
          variant="dark"
          title={ov("cta-banner-2", "title", "340+ Products are listed...")}
          description={ov(
            "cta-banner-2",
            "description",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt."
          )}
          buttonText={ov("cta-banner-2", "buttonText", "View Now")}
          buttonHref="#"
        />
      </div>
    ),
    services: () => (
      <div id="services" className={spacing.section.gap}>
        <ServicesSection />
      </div>
    ),
    courses: () => (
      <div id="courses" className={spacing.section.gap}>
        <CoursesSection />
      </div>
    ),
    portfolio: () => (
      <div id="portfolio" className={spacing.section.gap}>
        <PortfolioGridSection title="Portfolio" subtitle="Mini info section details" />
      </div>
    ),
    applications: () => (
      <div id="applications" className={spacing.section.gap}>
        <ApplicationsSection
          catalogTypeSlug="applications"
          title="Our Applications"
          subtitle="Mini info section details"
          maxItems={5}
          seeMoreHref="/applications"
        />
      </div>
    ),
    "zi-core-package": () => {
      const z = SECTION_CONTENT_DEFAULTS["zi-core-package"] ?? {};
      const st = ov("zi-core-package", "sectionTitle", z.sectionTitle ?? "");
      return (
        <div id="zi-core-package" className={spacing.section.gap}>
          <ZiCorePackageSection
            sectionTitle={st}
            sectionSubtitle={ov("zi-core-package", "sectionSubtitle", z.sectionSubtitle ?? "")}
            showSectionHeader={Boolean(String(st || "").trim())}
            headingBefore={ov("zi-core-package", "headingBefore", z.headingBefore ?? "A Global ")}
            headingAccent={ov("zi-core-package", "headingAccent", z.headingAccent ?? "Zi Core")}
            headingAfter={ov("zi-core-package", "headingAfter", z.headingAfter ?? " Development Package")}
            description={ov("zi-core-package", "description", z.description ?? "")}
            youtubeUrl={ov("zi-core-package", "youtubeUrl", z.youtubeUrl ?? "")}
            getStartedLabel={ov("zi-core-package", "getStartedLabel", z.getStartedLabel ?? "Get Started")}
            getStartedHref={ov("zi-core-package", "getStartedHref", z.getStartedHref ?? "/zi-core-package")}
            watchDemoLabel={ov("zi-core-package", "watchDemoLabel", z.watchDemoLabel ?? "Watch Demo")}
            watchDemoUrl={ov("zi-core-package", "watchDemoUrl", (z.watchDemoUrl && z.watchDemoUrl.trim()) || "#")}
          />
        </div>
      );
    },
    "feature-cards": () => (
      <div id="feature-cards" className={spacing.section.gap}>
        <FeatureCardsSection />
      </div>
    ),
    "cta-banner-3": () => (
      <div id="cta-banner-3" className={spacing.section.gap}>
        <CtaBanner
          variant="dark"
          title={ov("cta-banner-3", "title", "Like what you see?")}
          description={ov(
            "cta-banner-3",
            "description",
            "Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
          )}
          buttonText={ov("cta-banner-3", "buttonText", "Let's Work Together")}
          buttonHref={workTogetherWhatsAppHref}
        />
      </div>
    ),
    "other-pages": () => (
      <div id="other-pages" className={spacing.section.gap}>
        <DetailWithLeftSidebar
          sectionTitle={ov("other-pages", "sectionTitle", "My Projects")}
          sectionSubtitle={ov("other-pages", "sectionSubtitle", "Mini info section details")}
          heroImage={img("detail-hero") || "/hero.png"}
          title={ov(
            "other-pages",
            "title",
            "Title Here Lorem ipsum dolor sit amet Lorem ipsum dolor"
          )}
          author={ov("other-pages", "author", "Author name")}
          date={ov("other-pages", "date", "25 Jan 2026")}
          htmlContent={myProjectsHtmlContent}
          stickySidebar={true}
          topics={[
            { name: "Lifestyle", count: 3 },
            { name: "Inspiration", count: 2 },
            { name: "Fashion", count: 4 },
            { name: "Politics", count: 1 },
            { name: "Trending", count: 7 },
            { name: "Culture", count: 3 },
          ]}
        />
      </div>
    ),
    testimonials: () => (
      <div id="testimonials" className={spacing.section.gap}>
        <TestimonialsSection />
      </div>
    ),
    faqs: () => (
      <div id="faqs" className={spacing.section.gap}>
        <FAQsSection
          title={faqPage.title}
          subtitle={faqPage.subTitle || "Mini info section details"}
          items={faqPage.items}
          loading={!faqPage.loaded}
        />
      </div>
    ),
    "help-banner-1": () => (
      <div id="help-banner-1" className={spacing.section.gap}>
        <HelpBanner
          title={ov("help-banner-1", "title", "Looking for Help!")}
          description={ov(
            "help-banner-1",
            "description",
            "We are updating our Premium products with real-time support and a dedicated consultant to guide your soulmate search."
          )}
        />
      </div>
    ),
    contact: () => (
      <div id="contact" className={spacing.section.gap}>
        <ContactSection />
      </div>
    ),
    "cta-banner-4": () => (
      <div id="cta-banner-4" className={spacing.section.gap}>
        <CtaBanner
          variant="light"
          title={ov("cta-banner-4", "title", "340+ Products are listed...")}
          description={ov(
            "cta-banner-4",
            "description",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt."
          )}
          buttonText={ov("cta-banner-4", "buttonText", "Explore More")}
          buttonHref="#"
        />
      </div>
    ),
    "scale-operations": () => (
      <div id="scale-operations" className={spacing.section.gap}>
        <ScaleOperationsBanner
          tag={ov("scale-operations", "tag", "Transform Your Business")}
          heading={ov(
            "scale-operations",
            "heading",
            "Ready to Scale Your Corporate Operations?"
          )}
          description={ov(
            "scale-operations",
            "description",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
          )}
          features={parseMultilineStringArray(
            ov("scale-operations", "features", scaleOpsFeaturesDefault)
          )}
          primaryButtonText={ov("scale-operations", "primaryButtonText", "Start Free Trial")}
          primaryButtonHref={ov("scale-operations", "primaryButtonHref", "#")}
          secondaryButtonText={ov("scale-operations", "secondaryButtonText", "Schedule Demo")}
          secondaryButtonHref={ov("scale-operations", "secondaryButtonHref", "#")}
          trustText={ov(
            "scale-operations",
            "trustText",
            "Trusted by 500+ companies worldwide"
          )}
          ratingText={ov("scale-operations", "ratingText", "4.9/5 (2,300+ reviews)")}
        />
      </div>
    ),
    "feature-service": () => (
      <div id="feature-service" className={spacing.section.gap}>
        <FeatureServiceCardSection
          items={[{ title: "Rapid Implementation", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.", ctaText: "Discover How", ctaHref: "#", badge: "TOP RATED" }]}
        />
      </div>
    ),
    "hero-business": () => (
      <div id="hero-business" className={spacing.section.gap}>
        <HeroBannerBusiness
          heading="Transform Your Business Vision Into Reality"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
          primaryButtonText="Get Started Today"
          primaryButtonHref="#"
          watchDemoText="Watch Demo"
          watchDemoHref="#"
          stats={[
            { value: "500+", label: "Successful Projects" },
            { value: "98%", label: "Client Satisfaction" },
            { value: "10+", label: "Years Experience" },
            { value: "50+", label: "Customers" },
          ]}
          imageSrc={img("hero-business")}
          imageAlt="Hero business"
        />
      </div>
    ),
    team: () => (
      <div id="team" className={spacing.section.gap}>
        <TeamSection
          title={ov("team", "title", "Team")}
          subtitle={ov("team", "subtitle", "Our Hardworking Team")}
          members={[
            { imageSrc: img("team-1") || "https://placehold.co/400x500?text=Sarah+Chen", name: "Sarah Chen", title: "Chief Executive Officer", description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.", socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" } },
            { imageSrc: img("team-2") || "https://placehold.co/400x500?text=David+Lee", name: "David Lee", title: "Product Manager", description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.", socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" } },
            { imageSrc: img("team-3") || "https://placehold.co/400x500?text=Laura+Rodriguez", name: "Laura Rodriguez", title: "Marketing Director", description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.", socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" } },
            { imageSrc: img("team-4") || "https://placehold.co/400x500?text=Michael+Brown", name: "Michael Brown", title: "Lead Engineer", description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.", socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" } },
          ]}
        />
      </div>
    ),
    "unlock-potential": () => (
      <div id="unlock-potential" className={spacing.section.gap}>
        <UnlockPotentialSection heading="Unlock Your Full Potential Today!" description="Join thousands of satisfied customers who have transformed their lives with our innovative solutions." primaryButtonText="Get Started Now" primaryButtonHref="#" secondaryButtonText="Learn More" secondaryButtonHref="#" imageSrc={img("unlock-image")} />
      </div>
    ),
    "call-to-action": () => (
      <div id="call-to-action" className={spacing.section.gap}>
        <CallToActionSection heading="Call To Action" description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." buttonText="Call To Action" buttonHref="#" backgroundImage={img("cta-bg")} />
      </div>
    ),
    "features-details": () => (
      <div id="features-details" className={spacing.section.gap}>
        <FeaturesDetailsSection
          title="Features Details"
          description="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit"
          feature1={{
            heading: "Voluptatem dignissimos provident quasi corporis voluptates sit assumenda.",
            paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            bullets: ["Ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Duis aute irure dolor in reprehenderit in voluptate velit.", "Ullam est qui quos consequatur eos accusamus."],
            imageSrc: img("feature-1"),
            imageAlt: "Feature illustration",
          }}
          feature2={{
            heading: "Corporis temporibus maiores provident",
            paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            paragraph2: "Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
            imageSrc: img("feature-2"),
            imageAlt: "Feature illustration",
          }}
        />
      </div>
    ),
    clients: () => {
      const slidesFromBuilder = parseClientLogoSlidesMultiline(
        ov("clients", "logoSlides", SECTION_CONTENT_DEFAULTS.clients?.logoSlides ?? "")
      );
      return (
        <div id="clients" className={spacing.section.gap}>
          <ClientsSection
            title={ov("clients", "title", "Clients")}
            description={ov(
              "clients",
              "description",
              "Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit"
            )}
            logoHeight={60}
            {...(slidesFromBuilder ? { slides: slidesFromBuilder } : {})}
          />
        </div>
      );
    },
    excellence: () => (
      <div id="excellence" className={spacing.section.gap}>
        <ExcellenceSection
          heading={ov("excellence", "heading", "Building Excellence Since 1995")}
          headingUnderline={ov("excellence", "headingUnderline", "Building Excellence")}
          paragraph1={ov(
            "excellence",
            "paragraph1",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          )}
          paragraph2={ov(
            "excellence",
            "paragraph2",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          )}
          stats={parseStatLinesMultiline(
            ov("excellence", "statsLines", excellenceStatsDefault)
          )}
        />
      </div>
    ),
    "help-banner-2": () => (
      <div id="help-banner-2" className={spacing.section.gap}>
        <HelpBanner
          variant="card"
          title={ov("help-banner-2", "title", "Ready to Start Your Construction Project?")}
          description={ov(
            "help-banner-2",
            "description",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi."
          )}
          buttonText={ov("help-banner-2", "buttonText", "Request a Free Quote")}
          buttonHref="#"
        />
      </div>
    ),
    "event-banner": () => (
      <div id="event-banner" className={spacing.section.gap}>
        <EventBanner month="OCT" day={28} title="Open Campus Day" description="Experience our vibrant campus life, meet faculty members, and learn about our academic programs." buttonText="Register" buttonHref="#" />
      </div>
    ),
    "limited-offer": () => (
      <div id="limited-offer" className={spacing.section.gap}>
        <LimitedOfferBanner title="Limited Time Offer" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit." buttonText="Claim Offer" buttonHref="#" />
      </div>
    ),
    "coming-soon": () => (
      <div id="coming-soon" className={spacing.section.gap}>
        <ComingSoonSection
          title={ov("coming-soon", "title", "Maundy")}
          tagline={ov(
            "coming-soon",
            "tagline",
            "We are still working on our website. Stay tuned for updates!"
          )}
        />
      </div>
    ),
  };
}

function parseSectionData(list: { sectionId: string; label: string; isCustom?: boolean; code?: string }[]) {
  const labelMap: Record<string, string> = {};
  const codeMap: Record<string, string> = {};
  list.forEach((s) => {
    if (s.sectionId && s.label) labelMap[s.sectionId] = s.label;
    const raw = typeof s.code === "string" ? s.code : "";
    if (!s.sectionId || !raw.trim()) return;
    if (isCatalogStyleLandingSectionId(s.sectionId)) return;
    codeMap[s.sectionId] = raw;
  });
  return { labelMap, codeMap };
}

function parseBanner2Map(list: { slot?: string; imageUrl?: string }[]) {
  const map: Record<string, string> = {};
  list.forEach((b) => {
    if (b.slot && b.imageUrl) map[b.slot] = b.imageUrl;
  });
  return map;
}

export default function SecondLanding() {
  const { hash } = useLocation();
  const [companyData, setCompanyData] = useState<{
    company: string;
    logo?: string;
    favicon?: string;
    phone?: string;
    slogan?: string;
    description?: string;
    copyright?: string;
    socialLinks?: Record<string, string>;
  }>(() => {
    const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
    return {
      company: cachedCompany?.company || DEFAULT_COMPANY_NAME,
      logo: cachedCompany?.logo || "",
      favicon: cachedCompany?.favicon || "",
      phone: cachedCompany?.phone || "",
      slogan: cachedCompany?.slogan || "",
      description: cachedCompany?.description || "",
      copyright: cachedCompany?.copyright || "",
      socialLinks: cachedCompany?.socialLinks || {},
    };
  });
  const [faqPage, setFaqPage] = useState<FaqPageSlice>({
    title: "FAQs",
    subTitle: "",
    items: [],
    loaded: false,
  });
  const [enabledSectionIds, setEnabledSectionIds] = useState<string[] | null>(() => {
    const cached = getCachedData<string[]>(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
    return cached ?? null;
  });
  const [sectionLabels, setSectionLabels] = useState<Record<string, string>>(() => {
    const cached = getCachedData<{ labelMap: Record<string, string>; codeMap: Record<string, string> }>(CACHE_KEYS.LANDING_SECTIONS);
    return cached?.labelMap ?? {};
  });
  const [customSectionCodeMap, setCustomSectionCodeMap] = useState<Record<string, string>>(() => {
    const cached = getCachedData<{ labelMap: Record<string, string>; codeMap: Record<string, string> }>(CACHE_KEYS.LANDING_SECTIONS);
    return cached?.codeMap ?? {};
  });
  const [sectionContentMap, setSectionContentMap] = useState<Record<string, Record<string, string>>>(() => {
    const cached = getCachedData<{
      labelMap?: Record<string, string>;
      codeMap?: Record<string, string>;
      contentMap?: Record<string, Record<string, string>>;
    }>(CACHE_KEYS.LANDING_SECTIONS);
    return cached?.contentMap ?? {};
  });
  const [sectionShowInNavbarDropdown, setSectionShowInNavbarDropdown] = useState<Record<string, boolean>>(() => {
    const cached = getCachedData<{
      navDropdownMap?: Record<string, boolean>;
    }>(CACHE_KEYS.LANDING_SECTIONS);
    return cached?.navDropdownMap ?? {};
  });
  const [banner2Map, setBanner2Map] = useState<Record<string, string>>(() => {
    const cached = getCachedData<Record<string, string>>(CACHE_KEYS.BANNERS2);
    return cached ?? {};
  });

  // Single combined fetch - one re-render when all data is ready (reduces blink)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ids, list, banners] = await Promise.all([
          getEnabledLandingSections().catch(() => []),
          getLandingSections().catch(() => []),
          getBanners2().catch(() => []),
        ]);
        setEnabledSectionIds(ids);
        const { labelMap, codeMap } = parseSectionData(list);
        const contentMap = buildSectionContentMapFromList(list);
        setSectionLabels(labelMap);
        setCustomSectionCodeMap(codeMap);
        setSectionContentMap(contentMap);
        const navDropdownMap: Record<string, boolean> = {};
        (list || []).forEach((row: { sectionId?: string; showInNavbarDropdown?: boolean }) => {
          if (row.sectionId) navDropdownMap[row.sectionId] = row.showInNavbarDropdown !== false;
        });
        setSectionShowInNavbarDropdown(navDropdownMap);
        setBanner2Map(parseBanner2Map(banners));
        setCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS, ids);
        setCachedData(CACHE_KEYS.LANDING_SECTIONS, { labelMap, codeMap, contentMap, navDropdownMap });
        setCachedData(CACHE_KEYS.BANNERS2, parseBanner2Map(banners));
      } catch {
        setEnabledSectionIds([]);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const cachedCompany = getCachedData<any>(CACHE_KEYS.COMPANY);
        if (cachedCompany) {
          const normalized = {
            company: cachedCompany.company || DEFAULT_COMPANY_NAME,
            logo: cachedCompany.logo || "",
            favicon: cachedCompany.favicon || "",
            phone: cachedCompany.phone || "",
            slogan: cachedCompany.slogan || "",
            description: cachedCompany.description || "",
            copyright: cachedCompany.copyright || "",
            socialLinks: cachedCompany.socialLinks || {},
          };
          setCompanyData(normalized);
          applyCompanyBranding(normalized);
        }

        const latestCompany = await getCompany();
        const normalized = {
          company: latestCompany?.company || DEFAULT_COMPANY_NAME,
          logo: latestCompany?.logo || "",
          favicon: latestCompany?.favicon || "",
          phone: latestCompany?.phone || "",
          slogan: latestCompany?.slogan || "",
          description: latestCompany?.description || "",
          copyright: latestCompany?.copyright || "",
          socialLinks: latestCompany?.socialLinks || {},
        };
        setCompanyData(normalized);
        setCachedData(CACHE_KEYS.COMPANY, latestCompany);
        applyCompanyBranding(normalized);
      } catch {
        applyCompanyBranding(companyData);
      }
    };
    loadCompanyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await getContentByType("faqs");
        setFaqPage({
          title: data.title || "FAQs",
          subTitle: data.subTitle || "",
          items: Array.isArray(data.faqs) ? data.faqs : [],
          loaded: true,
        });
      } catch {
        setFaqPage((p) => ({ ...p, loaded: true }));
      }
    };
    loadFaqs();
  }, []);

  const img = (slot: string) => banner2Map[slot] || "";

  const sectionsReady = enabledSectionIds !== null;
  const sectionOrder =
    enabledSectionIds != null && enabledSectionIds.length > 0
      ? enabledSectionIds
      : DEFAULT_LANDING_SECTION_ORDER;

  const sectionRenderers = React.useMemo(
    () =>
      createSectionRenderers(
        img,
        {
          companyName: companyData.company || DEFAULT_COMPANY_NAME,
          slogan: companyData.slogan,
          description: companyData.description,
          socialLinks: companyData.socialLinks,
        },
        faqPage,
        buildWhatsAppUrl(companyData.phone, "Hello, I visited the ZI_Core site. I would like to ask you"),
        sectionContentMap
      ),
    [
      banner2Map,
      companyData.company,
      companyData.slogan,
      companyData.description,
      companyData.socialLinks,
      companyData.phone,
      faqPage,
      sectionContentMap,
    ]
  );

  const otherPagesItems: { id: string; label: string }[] = !sectionsReady
    ? []
    : sectionOrder
        .filter((sectionId) => {
          const scrollId = sectionId === "hero" ? "home" : sectionId;
          if (MAIN_NAV_SCROLL_IDS.has(scrollId)) return false;
          if (sectionShowInNavbarDropdown[sectionId] === false) return false;
          return true;
        })
        .map((sectionId) => {
          const scrollId = sectionId === "hero" ? "home" : sectionId;
          return { id: scrollId, label: sectionLabels[sectionId] || sectionId };
        });

  const landingScrollSpyOrder = useMemo(() => {
    if (!sectionsReady) return [];
    return sectionOrder.map((sid) => {
      if (sid === "hero") return customSectionCodeMap[sid] ? "hero" : "home";
      return sid;
    });
  }, [sectionsReady, sectionOrder, customSectionCodeMap]);

  const otherPagesScrollIds = useMemo(() => {
    if (!sectionsReady) return [];
    return sectionOrder
      .filter((sectionId) => {
        const scrollId = sectionId === "hero" ? "home" : sectionId;
        if (MAIN_NAV_SCROLL_IDS.has(scrollId)) return false;
        if (sectionShowInNavbarDropdown[sectionId] === false) return false;
        return true;
      })
      .map((sectionId) => (sectionId === "hero" ? "home" : sectionId));
  }, [sectionsReady, sectionOrder, sectionShowInNavbarDropdown]);

  const mainNavLinks = useMemo(() => {
    if (!sectionsReady || enabledSectionIds == null) return [];
    return buildFilteredMainNavLinks({
      enabledSectionIds: sectionOrder,
      otherPagesItems,
    });
  }, [sectionsReady, enabledSectionIds, sectionOrder, otherPagesItems]);

  useEffect(() => {
    const hashId = hash?.replace("#", "");
    if (!hashId || !sectionsReady) return;
    const el = document.getElementById(hashId);
    if (el) {
      const t = window.setTimeout(() => {
        smoothScrollToElement(el, { duration: 5000 });
      }, 100);
      return () => window.clearTimeout(t);
    }
  }, [hash, sectionsReady]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent second-landing-page">
      <Navbar2
        bottomDivHasColor={false}
        otherPagesItems={otherPagesItems}
        companyName={companyData.company || DEFAULT_COMPANY_NAME}
        hireMeHref={buildWhatsAppUrl(companyData.phone, "Hello, I visited the ZI_Core site. I would like to ask you")}
        companySocialLinks={companyData.socialLinks}
        landingScrollSpyOrder={landingScrollSpyOrder}
        otherPagesScrollIds={otherPagesScrollIds}
        mainNavLinks={mainNavLinks}
      />

      {/* Section gap from spacing.ts = outer padding (wrapper), not on section div */}
      <main className="flex-1 pt-0">
        {!sectionsReady ? (
          <PageLoader />
        ) : (
        sectionOrder.map((sectionId) => {
          const htmlOverride = customSectionCodeMap[sectionId];
          if (htmlOverride) {
            return (
              <div
                key={sectionId}
                id={sectionId}
                className={spacing.section.gap}
                dangerouslySetInnerHTML={{ __html: htmlOverride }}
              />
            );
          }
          const render = sectionRenderers[sectionId];
          if (render) {
            return <React.Fragment key={sectionId}>{render()}</React.Fragment>;
          }
          if (sectionId.startsWith("catalog-")) {
            const slug = sectionId.replace(/^catalog-/, "");
            const label = sectionLabels[sectionId] || slug;
            const shouldUseApplicationsTiles = ["applications", "apps", "websites"].includes(slug);
            return (
              <div key={sectionId} id={sectionId} className={spacing.section.gap}>
                {shouldUseApplicationsTiles ? (
                  <ApplicationsSection
                    catalogTypeSlug={slug}
                    title={label}
                    subtitle="Mini info section details"
                    maxItems={slug === "applications" ? 5 : undefined}
                    seeMoreHref={slug === "applications" ? "/applications" : undefined}
                  />
                ) : (
                  <CatalogSection
                    catalogTypeSlug={slug}
                    title={label}
                    subtitle="Mini info section details"
                  />
                )}
              </div>
            );
          }
          return null;
        }))}
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer variant="landing2" />
      </section>
      <FloatingWhatsApp
        phoneNumber={companyData.phone || ""}
        message="Hello, I visited the ZI_Core site. I would like to ask you"
        label="Chat on WhatsApp"
      />
    </div>
  );
}
