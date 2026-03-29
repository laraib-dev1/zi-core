/**
 * Second landing standard set: X, Facebook, LinkedIn, Instagram (same order as Team / navbar / footer).
 * Company panel overrides per key when set.
 */
export const DEFAULT_LANDING_SOCIAL: Record<string, string> = {
  twitter: "https://x.com",
  facebook: "https://www.facebook.com",
  linkedin: "https://www.linkedin.com",
  instagram: "https://www.instagram.com",
};

function isRealUrl(v: string | undefined): boolean {
  return Boolean(v && String(v).trim() !== "" && v !== "#");
}

/** Always returns URLs for all four platforms; company data overrides defaults when provided. */
export function pickSocialLinksOrDefault(
  raw?: Record<string, string | undefined> | null
): Record<string, string | undefined> {
  const out: Record<string, string> = { ...DEFAULT_LANDING_SOCIAL };
  if (!raw || typeof raw !== "object") return out;
  const tw = raw.twitter || raw.x;
  if (isRealUrl(tw)) out.twitter = String(tw).trim();
  if (isRealUrl(raw.facebook)) out.facebook = raw.facebook!.trim();
  if (isRealUrl(raw.linkedin)) out.linkedin = raw.linkedin!.trim();
  if (isRealUrl(raw.instagram)) out.instagram = raw.instagram!.trim();
  return out;
}
