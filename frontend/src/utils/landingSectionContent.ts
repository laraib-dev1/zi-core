/**
 * SpFolio editable copy + SecondLanding overrides. Keys are flat strings stored in DB `contentJson`.
 */

export type SectionEditFieldDef = { key: string; label: string; multiline?: boolean };

/** Field groups per static sectionId (not catalog / not custom-*). */
export const SECTION_EDIT_FIELD_DEFS: Record<string, SectionEditFieldDef[]> = {
  about: [
    { key: "sectionTitle", label: "Section heading (on page)" },
    { key: "sectionSubtitle", label: "Section subtitle" },
    { key: "title", label: "Main title" },
    { key: "tagline", label: "Tagline" },
  ],
  "cta-banner-1": [
    { key: "title", label: "Banner title" },
    { key: "description", label: "Description", multiline: true },
    { key: "buttonText", label: "Button text" },
  ],
  "cta-banner-2": [
    { key: "title", label: "Banner title" },
    { key: "description", label: "Description", multiline: true },
    { key: "buttonText", label: "Button text" },
  ],
  "cta-banner-3": [
    { key: "title", label: "Banner title" },
    { key: "description", label: "Description", multiline: true },
    { key: "buttonText", label: "Button text" },
  ],
  "cta-banner-4": [
    { key: "title", label: "Banner title" },
    { key: "description", label: "Description", multiline: true },
    { key: "buttonText", label: "Button text" },
  ],
  "text-image": [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", multiline: true },
    { key: "bullets", label: "Bullet lines (one per line)", multiline: true },
  ],
  "how-we-work": [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
  ],
  "help-banner-1": [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", multiline: true },
  ],
  "help-banner-2": [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", multiline: true },
    { key: "buttonText", label: "Button text" },
  ],
  "coming-soon": [
    { key: "title", label: "Title" },
    { key: "tagline", label: "Tagline", multiline: true },
  ],
  "other-pages": [
    { key: "sectionTitle", label: "Section heading" },
    { key: "sectionSubtitle", label: "Section subtitle" },
    { key: "title", label: "Article title" },
    { key: "author", label: "Author" },
    { key: "date", label: "Date line" },
  ],
};

/** Default copy matching SecondLanding hardcoded strings (used when DB empty). */
export const SECTION_CONTENT_DEFAULTS: Record<string, Record<string, string>> = {
  about: {
    sectionTitle: "About me",
    sectionSubtitle: "FCPS – General Surgeon | Medical Photographer",
    title: "We Take Surgery Beyond the Operating Room",
    tagline: "User Role or Tag Line",
  },
  "cta-banner-1": {
    title: "Discover Surgical Precision & Art",
    description:
      "Explore the intersection of medicine and visual storytelling through curated surgical documentation and photography.",
    buttonText: "Explore Now",
  },
  "cta-banner-2": {
    title: "340+ Products are listed...",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    buttonText: "View Now",
  },
  "cta-banner-3": {
    title: "Like what you see?",
    description:
      "Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat.",
    buttonText: "Let's Work Together",
  },
  "cta-banner-4": {
    title: "340+ Products are listed...",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    buttonText: "Explore More",
  },
  "text-image": {
    title: "Precision Meets Art in Surgery",
    description:
      "As a board-certified surgeon and medical photographer, I capture the discipline, skill, and human side of surgery. Each procedure is documented to educate, inspire, and showcase the artistry involved in modern surgical practice.",
    bullets: "Board-Certified General Surgeon\nPassionate Photographer\nBridges Surgery and Storytellingt",
  },
  "how-we-work": {
    title: "How We Work",
    subtitle: "Title info description details",
  },
  "help-banner-1": {
    title: "Looking for Help!",
    description:
      "We are updating our Premium products with real-time support and a dedicated consultant to guide your soulmate search.",
  },
  "help-banner-2": {
    title: "Ready to Start Your Construction Project?",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.",
    buttonText: "Request a Free Quote",
  },
  "coming-soon": {
    title: "Maundy",
    tagline: "We are still working on our website. Stay tuned for updates!",
  },
  "other-pages": {
    sectionTitle: "My Projects",
    sectionSubtitle: "Mini info section details",
    title: "Title Here Lorem ipsum dolor sit amet Lorem ipsum dolor",
    author: "Author name",
    date: "25 Jan 2026",
  },
};

export function getEditFieldDefsForSection(sectionId: string): SectionEditFieldDef[] {
  if (sectionId.startsWith("custom-")) return [];
  return SECTION_EDIT_FIELD_DEFS[sectionId] ?? [];
}

export function parseContentJsonString(raw?: string | null): Record<string, string> {
  if (!raw || typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, v == null ? "" : String(v)])
    );
  } catch {
    return {};
  }
}

export function mergeContentForEditor(sectionId: string, rawJson?: string | null): Record<string, string> {
  const defs = getEditFieldDefsForSection(sectionId);
  const defaults = SECTION_CONTENT_DEFAULTS[sectionId] ?? {};
  const fromDb = parseContentJsonString(rawJson);
  const out: Record<string, string> = {};
  for (const d of defs) {
    const v = fromDb[d.key];
    out[d.key] = v !== undefined && v !== "" ? v : (defaults[d.key] ?? "");
  }
  return out;
}

export function packContentForSave(sectionId: string, fields: Record<string, string>): string {
  const defs = getEditFieldDefsForSection(sectionId);
  const defaults = SECTION_CONTENT_DEFAULTS[sectionId] ?? {};
  const out: Record<string, string> = {};
  for (const d of defs) {
    const val = (fields[d.key] ?? "").trim();
    const def = (defaults[d.key] ?? "").trim();
    if (val !== def) out[d.key] = fields[d.key] ?? "";
  }
  return JSON.stringify(out);
}

export function buildSectionContentMapFromList(
  list: { sectionId: string; contentJson?: string }[]
): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const s of list) {
    if (!s.sectionId) continue;
    const parsed = parseContentJsonString(s.contentJson);
    if (Object.keys(parsed).length === 0) continue;
    map[s.sectionId] = parsed;
  }
  return map;
}

/** Resolve override: non-empty DB value wins, else fallback (page default). */
export function contentOverride(
  contentMap: Record<string, Record<string, string>>,
  sectionId: string,
  key: string,
  fallback: string
): string {
  const v = contentMap[sectionId]?.[key];
  if (v == null) return fallback;
  const t = String(v).trim();
  return t !== "" ? String(v) : fallback;
}
