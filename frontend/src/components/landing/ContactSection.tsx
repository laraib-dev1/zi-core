import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import ContactCard from "@/components/landing/ContactCard";
import ContactForm from "@/components/landing/ContactForm";
import { spacing } from "@/utils/spacing";
import { getCompany } from "@/api/company.api";
import { createQuery } from "@/api/query.api";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";
import { useToast } from "@/components/ui/toast";

const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184052376643!2d-73.987844923269!3d40.748440971389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b30eac6f%3A0x9d92f77d2b1c5c!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890";

export default function ContactSection() {
  const { success, error } = useToast();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cached = getCachedData<any>(CACHE_KEYS.COMPANY);
    if (cached) {
      if (cached.phone) setPhone(String(cached.phone));
      if (cached.email) setEmail(String(cached.email));
      if (cached.address) setAddress(String(cached.address));
    }
    getCompany()
      .then((c) => {
        if (c?.phone) setPhone(String(c.phone));
        if (c?.email) setEmail(String(c.email));
        if (c?.address) setAddress(String(c.address));
      })
      .catch(() => {});
  }, []);

  const displayPhone = phone.trim() || "+1 5589 55488 55";
  const displayEmail = email.trim() || "info@example.com";
  const displayAddress = address.trim() || "A108 Adam Street, New York, NY 53502";

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
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="space-y-4">
              <ContactCard
                icon={Phone}
                title="Call"
                detail={displayPhone}
                href={`tel:${displayPhone.replace(/\s/g, "")}`}
              />
              <ContactCard
                icon={Mail}
                title="Email"
                detail={displayEmail}
                href={`mailto:${displayEmail}`}
              />
              <ContactCard
                icon={MapPin}
                title="Address"
                detail={displayAddress}
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

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <ContactForm
                submitting={submitting}
                onSubmit={async (data) => {
                  const emailTrim = data.email.trim();
                  const msgTrim = data.message.trim();
                  if (!emailTrim || !msgTrim) {
                    error("Please enter your email and message.");
                    return;
                  }
                  setSubmitting(true);
                  try {
                    const subjectLine = data.subject.trim() || "Contact form";
                    const body = [data.name ? `Name: ${data.name}` : null, msgTrim]
                      .filter(Boolean)
                      .join("\n\n");
                    await createQuery({
                      email: emailTrim,
                      subject: subjectLine,
                      description: body,
                    });
                    success("Your message was sent. We will get back to you soon.");
                  } catch (e: unknown) {
                    const ax = e as { response?: { data?: { message?: string } } };
                    const msg =
                      ax.response?.data?.message ||
                      (e instanceof Error ? e.message : null) ||
                      "Could not send your message.";
                    error(String(msg));
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Container12>
    </section>
  );
}
