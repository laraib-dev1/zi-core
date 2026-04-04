import React from "react";
import Navbar2 from "@/components/layout/Navbar2";
import Footer from "@/components/layout/Footer";
import Container12 from "@/components/layout/Container12";
import { spacing } from "@/utils/spacing";
import { useSecondLandingNavbarProps } from "@/hooks/useSecondLandingNavbarProps";

/** Zi Core package iframe page — route: `/zi-core-package` (legacy `/get-started` redirects). */
export default function GetStartedPage() {
  const landingNav = useSecondLandingNavbarProps();

  return (
    <div className="min-h-screen flex flex-col bg-white pt-20 landing-detail-page">
      <Navbar2
        bottomDivHasColor={false}
        otherPagesItems={landingNav.otherPagesItems}
        companyName={landingNav.companyName}
        hireMeHref={landingNav.hireMeHref}
        companySocialLinks={landingNav.companySocialLinks}
        mainNavLinks={landingNav.mainNavLinks}
      />
      <main className="flex-1 pt-8 pb-16">
        <Container12 className={spacing.inner.gap}>
          <header className="text-center border-b border-gray-200 pb-8 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold theme-heading">Zi_Core</h1>
            <p className="text-base sm:text-lg text-gray-500 mt-3">Best Development Environment</p>
          </header>
          <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm min-h-[min(85vh,900px)]">
            <iframe
              title="Zi Core on Surge"
              src="https://zi_core.surge.sh/"
              className="w-full h-[min(85vh,900px)] border-0 block"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container12>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer variant="landing2" />
      </section>
    </div>
  );
}
