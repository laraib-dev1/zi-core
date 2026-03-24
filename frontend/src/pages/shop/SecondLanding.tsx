import React, { useEffect, useState } from "react";
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
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import PageLoader from "@/components/ui/PageLoader";
import { Search, Lightbulb, Settings, Rocket, Package } from "lucide-react";
import { smoothScrollToElement } from "@/lib/utils";

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

const MAIN_NAV_SCROLL_IDS = new Set(["home", "about", "portfolio", "testimonials", "other-pages", "contact"]);

// Default order when API hasn't loaded yet - must match backend DEFAULT_SECTIONS
const DEFAULT_SECTION_ORDER = [
  "hero", "about", "cta-banner-1", "text-image", "how-we-work", "cta-banner-2", "services", "courses",
  "portfolio", "feature-cards", "cta-banner-3", "other-pages", "testimonials", "faqs", "help-banner-1",
  "contact", "cta-banner-4", "scale-operations", "feature-service", "hero-business", "team",
  "unlock-potential", "call-to-action", "features-details", "clients", "excellence", "help-banner-2",
  "event-banner", "limited-offer", "coming-soon",
];

type ImgFn = (slot: string) => string;

function createSectionRenderers(img: ImgFn): Record<string, () => React.ReactNode> {
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
          introduction="I'm"
          title="Dr. Ali Athar"
          titleClassName="theme-text-primary"
          subtitle="FCPS, Surgeon"
          description="Where surgery meets storytelling.
This platform showcases my journey as a surgeon and medical photographer, capturing the precision, discipline, and artistry behind every procedure. Through both scalpel and lens, I document the science, the skill, and the human side of surgery."
          buttons={[
            { label: "View Portfolio", href: "#portfolio", variant: "primary" },
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
          sectionTitle="About me"
          sectionSubtitle="FCPS – General Surgeon | Medical Photographer"
          title="We Take Surgery Beyond the Operating Room"
          tagline="User Role or Tag Line"
          images={[img("about-1") || "/hero.png", img("about-2") || "/hero.png", img("about-3") || "/hero.png", img("about-4") || "/hero.png"]}
        />
      </div>
    ),
    "cta-banner-1": () => (
      <div id="cta-banner-1" className={spacing.section.gap}>
        <CtaBanner 
        variant="light" 
        title="Discover Surgical Precision & Art" description="Explore the intersection of medicine and visual storytelling through curated surgical documentation and photography." 
        buttonText="Explore Now" 
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
          title="Precision Meets Art in Surgery"
          description="As a board-certified surgeon and medical photographer, I capture the discipline, skill, and human side of surgery. Each procedure is documented to educate, inspire, and showcase the artistry involved in modern surgical practice."
          bullets={["Board-Certified General Surgeon", "Passionate Photographer", "Bridges Surgery and Storytellingt"]}
          imagePosition="left"
          imageSrc={img("text-image") || "/hero.png"}
        />
      </div>
    ),
    "how-we-work": () => (
      <div id="how-we-work" className={spacing.section.gap}>
        <HowWeWorkBlocks title="How We Work" subtitle="Title info description details" items={howWeWorkItems} />
      </div>
    ),
    "cta-banner-2": () => (
      <div id="cta-banner-2" className={spacing.section.gap}>
        <CtaBanner variant="dark" title="340+ Products are listed..." description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." buttonText="View Now" buttonHref="#" />
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
    "feature-cards": () => (
      <div id="feature-cards" className={spacing.section.gap}>
        <FeatureCardsSection />
      </div>
    ),
    "cta-banner-3": () => (
      <div id="cta-banner-3" className={spacing.section.gap}>
        <CtaBanner variant="dark" title="Like what you see?" description="Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat." buttonText="Let's Work Together" buttonHref="#" />
      </div>
    ),
    "other-pages": () => (
      <div id="other-pages" className={spacing.section.gap}>
        <DetailWithLeftSidebar
          sectionTitle="My Projects"
          sectionSubtitle="Mini info section details"
          heroImage={img("detail-hero") || "/hero.png"}
          title="Title Here Lorem ipsum dolor sit amet Lorem ipsum dolor"
          author="Author name"
          date="25 Jan 2026"
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
        <FAQsSection />
      </div>
    ),
    "help-banner-1": () => (
      <div id="help-banner-1" className={spacing.section.gap}>
        <HelpBanner title="Looking for Help!" description="We are updating our Premium products with real-time support and a dedicated consultant to guide your soulmate search." />
      </div>
    ),
    contact: () => (
      <div id="contact" className={spacing.section.gap}>
        <ContactSection />
      </div>
    ),
    "cta-banner-4": () => (
      <div id="cta-banner-4" className={spacing.section.gap}>
        <CtaBanner variant="light" title="340+ Products are listed..." description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." buttonText="Explore More" buttonHref="#" />
      </div>
    ),
    "scale-operations": () => (
      <div id="scale-operations" className={spacing.section.gap}>
        <ScaleOperationsBanner
          tag="Transform Your Business"
          heading="Ready to Scale Your Corporate Operations?"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
          features={["Advanced Analytics Dashboard", "24/7 Enterprise Support", "Custom Integration Solutions"]}
          primaryButtonText="Start Free Trial"
          primaryButtonHref="#"
          secondaryButtonText="Schedule Demo"
          secondaryButtonHref="#"
          trustText="Trusted by 500+ companies worldwide"
          ratingText="4.9/5 (2,300+ reviews)"
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
          title="Team"
          subtitle="Our Hardworking Team"
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
    clients: () => (
      <div id="clients" className={spacing.section.gap}>
        <ClientsSection title="Clients" description="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit" logoHeight={60} />
      </div>
    ),
    excellence: () => (
      <div id="excellence" className={spacing.section.gap}>
        <ExcellenceSection
          heading="Building Excellence Since 1995"
          headingUnderline="Building Excellence"
          paragraph1="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          paragraph2="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          stats={[{ value: "25+", label: "Years Experience" }, { value: "500+", label: "Projects Completed" }, { value: "100%", label: "Client Satisfaction" }, { value: "48", label: "Team Members" }]}
        />
      </div>
    ),
    "help-banner-2": () => (
      <div id="help-banner-2" className={spacing.section.gap}>
        <HelpBanner variant="card" title="Ready to Start Your Construction Project?" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi." buttonText="Request a Free Quote" buttonHref="#" />
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
        <ComingSoonSection title="Maundy" tagline="We are still working on our website. Stay tuned for updates!" />
      </div>
    ),
  };
}

function parseSectionData(list: { sectionId: string; label: string; isCustom?: boolean; code?: string }[]) {
  const labelMap: Record<string, string> = {};
  const codeMap: Record<string, string> = {};
  list.forEach((s) => {
    if (s.sectionId && s.label) labelMap[s.sectionId] = s.label;
    if (s.isCustom && s.sectionId && s.code) codeMap[s.sectionId] = s.code;
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
        setSectionLabels(labelMap);
        setCustomSectionCodeMap(codeMap);
        setBanner2Map(parseBanner2Map(banners));
        setCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS, ids);
        setCachedData(CACHE_KEYS.LANDING_SECTIONS, { labelMap, codeMap });
        setCachedData(CACHE_KEYS.BANNERS2, parseBanner2Map(banners));
      } catch {
        setEnabledSectionIds([]);
      }
    };
    fetchAll();
  }, []);

  const img = (slot: string) => banner2Map[slot] || "";

  const sectionsReady = enabledSectionIds !== null;
  const sectionOrder =
    enabledSectionIds != null && enabledSectionIds.length > 0
      ? enabledSectionIds
      : DEFAULT_SECTION_ORDER;

  const sectionRenderers = React.useMemo(() => createSectionRenderers(img), [banner2Map]);

  const otherPagesItems: { id: string; label: string }[] =
    enabledSectionIds == null || enabledSectionIds.length === 0
      ? []
      : enabledSectionIds
          .filter((sectionId) => {
            const scrollId = sectionId === "hero" ? "home" : sectionId;
            return !MAIN_NAV_SCROLL_IDS.has(scrollId);
          })
          .map((sectionId) => {
            const scrollId = sectionId === "hero" ? "home" : sectionId;
            return { id: scrollId, label: sectionLabels[sectionId] || sectionId };
          });

  useEffect(() => {
    const hashId = hash?.replace("#", "");
    if (hashId) {
      const el = document.getElementById(hashId);
      if (el) {
        setTimeout(() => {
          smoothScrollToElement(el, { duration: 5000 });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent second-landing-page">
      <Navbar2 bottomDivHasColor={false} otherPagesItems={otherPagesItems} />

      {/* Section gap from spacing.ts = outer padding (wrapper), not on section div */}
      <main className="flex-1 pt-0">
        {!sectionsReady ? (
          <PageLoader />
        ) : (
        sectionOrder.map((sectionId) => {
          const render = sectionRenderers[sectionId];
          if (render) {
            return <React.Fragment key={sectionId}>{render()}</React.Fragment>;
          }
          if (sectionId.startsWith("custom-") && customSectionCodeMap[sectionId]) {
            return (
              <div
                key={sectionId}
                id={sectionId}
                className={spacing.section.gap}
                dangerouslySetInnerHTML={{ __html: customSectionCodeMap[sectionId] }}
              />
            );
          }
          if (sectionId.startsWith("catalog-")) {
            const slug = sectionId.replace(/^catalog-/, "");
            const label = sectionLabels[sectionId] || slug;
            return (
              <div key={sectionId} id={sectionId} className={spacing.section.gap}>
                <CatalogSection
                  catalogTypeSlug={slug}
                  title={label}
                  subtitle="Mini info section details"
                />
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
        phoneNumber="1234567890"
        message="Hi, I'd like to get in touch."
        label="Chat on WhatsApp"
      />
    </div>
  );
}
