import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutHero from "@/components/about/AboutHero";
import HowWeWork from "@/components/about/HowWeWork";
import TeamSection from "@/components/about/TeamSection";
import { spacing } from "@/utils/spacing";

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1 w-full max-w-full overflow-x-hidden min-w-0`}>
        {/* Hero/Introduction Section */}
        <AboutHero />

        {/* How We Work Section */}
        <HowWeWork />

        {/* Team Section - commented out */}
        {/* <TeamSection /> */}
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Footer />
      </section>
    </div>
  );
}
