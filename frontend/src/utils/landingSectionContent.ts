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
  clients: [
    { key: "title", label: "Section title" },
    { key: "description", label: "Section description", multiline: true },
    {
      key: "logoSlides",
      label:
        "Logo slides — one line per logo (URL or URL|Alt). Blank line starts a new slide row.",
      multiline: true,
    },
  ],
  excellence: [
    { key: "heading", label: "Full heading (e.g. Building Excellence Since 1995)" },
    { key: "headingUnderline", label: "Part of heading with underline (e.g. Building Excellence)" },
    { key: "paragraph1", label: "First paragraph", multiline: true },
    { key: "paragraph2", label: "Second paragraph", multiline: true },
    {
      key: "statsLines",
      label: "Stat cards — one per line as Value|Label (e.g. 25+|Years Experience)",
      multiline: true,
    },
  ],
  "scale-operations": [
    { key: "tag", label: "Small tag above heading" },
    { key: "heading", label: "Main heading" },
    { key: "description", label: "Description", multiline: true },
    { key: "features", label: "Feature bullets (one line each)", multiline: true },
    { key: "primaryButtonText", label: "Primary button text" },
    { key: "primaryButtonHref", label: "Primary button link (URL or #anchor)" },
    { key: "secondaryButtonText", label: "Secondary button text" },
    { key: "secondaryButtonHref", label: "Secondary button link" },
    { key: "trustText", label: "Trust line under buttons" },
    { key: "ratingText", label: "Rating / reviews line (e.g. 4.9/5 (2,300+ reviews))" },
  ],
  team: [
    { key: "title", label: "Section title" },
    { key: "subtitle", label: "Section subtitle" },
  ],
  "zi-core-package": [
    { key: "sectionTitle", label: "Optional section heading above columns (leave empty to hide)" },
    { key: "sectionSubtitle", label: "Section subtitle (when heading is shown)" },
    { key: "headingBefore", label: "Main title — text before accent (e.g. \"A Global \")" },
    { key: "headingAccent", label: "Main title — accent in theme color (e.g. \"Zi Core\")" },
    { key: "headingAfter", label: "Main title — text after accent" },
    { key: "description", label: "Description", multiline: true },
    { key: "youtubeUrl", label: "YouTube URL for embedded video (watch or youtu.be or embed)" },
    { key: "getStartedLabel", label: "Primary button label" },
    { key: "getStartedHref", label: "Primary button link (e.g. /zi-core-package)" },
    { key: "watchDemoLabel", label: "Secondary button label" },
    { key: "watchDemoUrl", label: "Secondary button URL (opens new tab — use YouTube watch link)" },
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
  clients: {
    title: "Clients",
    description:
      "Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit",
    logoSlides: "",
  },
  excellence: {
    heading: "Building Excellence Since 1995",
    headingUnderline: "Building Excellence",
    paragraph1:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    paragraph2:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    statsLines: `25+|Years Experience
500+|Projects Completed
100%|Client Satisfaction
48|Team Members`,
  },
  "scale-operations": {
    tag: "Transform Your Business",
    heading: "Ready to Scale Your Corporate Operations?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    features: `Advanced Analytics Dashboard
24/7 Enterprise Support
Custom Integration Solutions`,
    primaryButtonText: "Start Free Trial",
    primaryButtonHref: "#",
    secondaryButtonText: "Schedule Demo",
    secondaryButtonHref: "#",
    trustText: "Trusted by 500+ companies worldwide",
    ratingText: "4.9/5 (2,300+ reviews)",
  },
  team: {
    title: "Team",
    subtitle: "Our Hardworking Team",
  },
  "zi-core-package": {
    sectionTitle: "",
    sectionSubtitle: "",
    headingBefore: "A Global ",
    headingAccent: "Zi Core",
    headingAfter: " Development Package",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    youtubeUrl: "https://youtu.be/mm8ubTNbsTQ",
    getStartedLabel: "Get Started",
    getStartedHref: "/zi-core-package",
    watchDemoLabel: "Watch Demo",
    watchDemoUrl: "https://youtu.be/mm8ubTNbsTQ",
  },
};

/** Client logo row for `ClientsSection` — parsed from Sp Builder multiline field. */
export type ClientLogoSlideItem = { imageUrl: string; alt?: string };

export function parseClientLogoSlidesMultiline(raw: string): ClientLogoSlideItem[][] | undefined {
  const text = String(raw ?? "").trim();
  if (!text) return undefined;
  const slides: ClientLogoSlideItem[][] = [];
  let current: ClientLogoSlideItem[] = [];
  const flush = () => {
    if (current.length) {
      slides.push(current);
      current = [];
    }
  };
  for (const line of String(raw).split("\n")) {
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    const pipe = t.indexOf("|");
    if (pipe >= 0) {
      current.push({
        imageUrl: t.slice(0, pipe).trim(),
        alt: t.slice(pipe + 1).trim() || undefined,
      });
    } else {
      current.push({ imageUrl: t, alt: undefined });
    }
  }
  flush();
  return slides.length ? slides : undefined;
}

export type StatLineItem = { value: string; label: string };

export function parseStatLinesMultiline(raw: string): StatLineItem[] | undefined {
  const lines = String(raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return undefined;
  const out: StatLineItem[] = [];
  for (const line of lines) {
    const pipe = line.indexOf("|");
    if (pipe < 0) continue;
    const value = line.slice(0, pipe).trim();
    const label = line.slice(pipe + 1).trim();
    if (value && label) out.push({ value, label });
  }
  return out.length ? out : undefined;
}

export function parseMultilineStringArray(raw: string): string[] | undefined {
  const lines = String(raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
}

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
