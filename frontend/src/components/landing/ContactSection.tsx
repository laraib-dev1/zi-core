import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ContactCard from "@/components/landing/ContactCard";
import ContactForm from "@/components/landing/ContactForm";
import { spacing } from "@/utils/spacing";

const DEFAULT_CALL = "+1 5589 55488 55";
const DEFAULT_EMAIL = "info@example.com";
const DEFAULT_ADDRESS = "A108 Adam Street, New York, NY 53502";
const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184052376643!2d-73.987844923269!3d40.748440971389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b30eac6f%3A0x9d92f77d2b1c5c!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890";

export default function ContactSection() {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <Container12 className={spacing.inner.gap}>
        <SectionHeader
          showBatch={false}
          showHeading
          heading="Contact"
          cutDividerVariant="withSides"
          showMiniInfo
          miniInfo="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit"
          showCutDivider={false}
          showDividerLine={true}
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mt-8 lg:mt-10">
          {/* Left: 60% — contact info + map */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="space-y-4">
              <ContactCard
                icon={Phone}
                title="Call"
                detail={DEFAULT_CALL}
                href={`tel:${DEFAULT_CALL.replace(/\s/g, "")}`}
              />
              <ContactCard
                icon={Mail}
                title="Email"
                detail={DEFAULT_EMAIL}
                href={`mailto:${DEFAULT_EMAIL}`}
              />
              <ContactCard
                icon={MapPin}
                title="Address"
                detail={DEFAULT_ADDRESS}
                href="https://www.google.com/maps"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 min-h-[280px]">
              <iframe
                title="Location map"
                src={DEFAULT_MAP_EMBED_URL}
                width="100%"
                height="100%"
                style={{ minHeight: "280px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0 w-full"
              />
            </div>
          </div>

          {/* Right: 40% — contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <ContactForm
                onSubmit={(data) => {
                  console.log("Contact form submitted:", data);
                }}
              />
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
