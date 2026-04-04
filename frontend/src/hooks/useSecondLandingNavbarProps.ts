import { useEffect, useState } from "react";
import { getCompany } from "@/api/company.api";
import { getEnabledLandingSections, getLandingSections } from "@/api/landingsection.api";
import { getCachedData, CACHE_KEYS } from "@/utils/cache";
import { buildWhatsAppUrl, DEFAULT_COMPANY_NAME } from "@/utils/companyBrand";
import {
  buildFilteredMainNavLinks,
  type Navbar2NavLinkItem,
} from "@/utils/landingNavbarLinks";
import { DEFAULT_LANDING_SECTION_ORDER } from "@/utils/defaultLandingSectionOrder";

/** Same set as SecondLanding – sections that appear in main nav (not “Other pages”). */
const MAIN_NAV_SCROLL_IDS = new Set([
  "home",
  "about",
  "portfolio",
  "testimonials",
  "applications",
  "other-pages",
  "contact",
]);

export type SecondLandingNavbarProps = {
  companyName: string;
  hireMeHref: string;
  companySocialLinks: Record<string, string | undefined>;
  otherPagesItems: { id: string; label: string }[];
  /** Filtered main nav (empty until first SpFolio load completes). */
  mainNavLinks: Navbar2NavLinkItem[];
};

/**
 * Same navbar data as the second landing page (company name, WhatsApp, socials, Other pages dropdown).
 * Use on catalog detail and any route that should feel like part of the landing experience.
 */
export function useSecondLandingNavbarProps(): SecondLandingNavbarProps {
  const [companyName, setCompanyName] = useState(() => {
    const c = getCachedData<any>(CACHE_KEYS.COMPANY);
    return c?.company || DEFAULT_COMPANY_NAME;
  });
  const [phone, setPhone] = useState(() => {
    const c = getCachedData<any>(CACHE_KEYS.COMPANY);
    return (c?.phone as string) || "";
  });
  const [socialLinks, setSocialLinks] = useState<Record<string, string | undefined>>(() => {
    const c = getCachedData<any>(CACHE_KEYS.COMPANY);
    return c?.socialLinks || {};
  });
  const [otherPagesItems, setOtherPagesItems] = useState<{ id: string; label: string }[]>([]);
  const [mainNavLinks, setMainNavLinks] = useState<Navbar2NavLinkItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [ids, list, company] = await Promise.all([
          getEnabledLandingSections().catch(() => [] as string[]),
          getLandingSections().catch(() => [] as { sectionId: string; label: string }[]),
          getCompany().catch(() => null),
        ]);
        if (cancelled) return;

        const labelMap: Record<string, string> = {};
        (list || []).forEach((s) => {
          if (s.sectionId && s.label) labelMap[s.sectionId] = s.label;
        });

        const navDropdownBySection: Record<string, boolean> = {};
        (list || []).forEach((s: { sectionId?: string; showInNavbarDropdown?: boolean }) => {
          if (s.sectionId) navDropdownBySection[s.sectionId] = s.showInNavbarDropdown !== false;
        });

        const effectiveIds =
          Array.isArray(ids) && ids.length > 0 ? ids : DEFAULT_LANDING_SECTION_ORDER;

        const items = effectiveIds
          .filter((sectionId: string) => {
            const scrollId = sectionId === "hero" ? "home" : sectionId;
            if (MAIN_NAV_SCROLL_IDS.has(scrollId)) return false;
            if (navDropdownBySection[sectionId] === false) return false;
            return true;
          })
          .map((sectionId: string) => {
            const scrollId = sectionId === "hero" ? "home" : sectionId;
            return { id: scrollId, label: labelMap[sectionId] || sectionId };
          });

        setOtherPagesItems(items);
        setMainNavLinks(
          buildFilteredMainNavLinks({
            enabledSectionIds: effectiveIds,
            otherPagesItems: items,
          })
        );

        if (company) {
          setCompanyName(company.company || DEFAULT_COMPANY_NAME);
          setPhone(company.phone || "");
          setSocialLinks(company.socialLinks || {});
        }
      } catch {
        /* keep cache-driven state */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    companyName,
    hireMeHref: buildWhatsAppUrl(phone, "Hello, I visited the ZI_Core site. I would like to ask you"),
    companySocialLinks: socialLinks,
    otherPagesItems,
    mainNavLinks,
  };
}
