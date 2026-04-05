/**
 * Main navbar row (Home, About, Portfolio, …): show when that section is **enabled** in SpFolio
 * (on the page). The "Show in navbar" switch only affects **Other pages** dropdown entries —
 * not these primary links, so Home / Contact etc. stay visible when the section exists.
 */

export type Navbar2NavLinkItem = {
  to: string;
  label: string;
  hash: string;
  hasDropdown?: boolean;
};

/** Full template (order preserved when filtering). */
const NAV_TEMPLATE: (Navbar2NavLinkItem & { sectionId: string })[] = [
  { to: "#home", label: "Home", hash: "home", sectionId: "hero" },
  { to: "#applications", label: "Applications", hash: "applications", sectionId: "applications" },
  { to: "#about", label: "About me", hash: "about", sectionId: "about" },
  { to: "#portfolio", label: "Portfolio", hash: "portfolio", sectionId: "portfolio" },
  { to: "#testimonials", label: "Testimonials", hash: "testimonials", sectionId: "testimonials" },
  {
    to: "#other-pages",
    label: "Other Pages",
    hash: "other-pages",
    hasDropdown: true,
    sectionId: "other-pages",
  },
  { to: "#contact", label: "Contact us", hash: "contact", sectionId: "contact" },
];

/** Default links when SpFolio data is not loaded yet — matches historical Navbar2. */
export const DEFAULT_NAVBAR2_MAIN_LINKS: Navbar2NavLinkItem[] = NAV_TEMPLATE.map(
  ({ sectionId: _s, ...rest }) => rest
);

/** Primary nav slots: visible whenever the section is enabled on the landing (ignore navbar toggle). */
function isMainNavSlotOnPage(sectionId: string, enabledSectionIds: string[]): boolean {
  return enabledSectionIds.includes(sectionId);
}

/**
 * @param enabledSectionIds — from `/landingsections/enabled`
 * @param otherPagesItems — dropdown entries (already filtered by enabled + "Show in navbar" per section)
 */
export function buildFilteredMainNavLinks(options: {
  enabledSectionIds: string[];
  /** Kept for API compatibility; main row links no longer use this. */
  sectionShowInNavbar?: Record<string, boolean>;
  otherPagesItems: { id: string; label: string }[];
}): Navbar2NavLinkItem[] {
  const { enabledSectionIds, otherPagesItems } = options;

  const out: Navbar2NavLinkItem[] = [];

  for (const row of NAV_TEMPLATE) {
    if (row.hasDropdown) {
      const hasOtherPagesSection = isMainNavSlotOnPage("other-pages", enabledSectionIds);
      const show = otherPagesItems.length > 0 || hasOtherPagesSection;
      if (show) {
        out.push({ to: row.to, label: row.label, hash: row.hash, hasDropdown: true });
      }
      continue;
    }

    if (isMainNavSlotOnPage(row.sectionId, enabledSectionIds)) {
      out.push({ to: row.to, label: row.label, hash: row.hash });
    }
  }

  return out;
}
