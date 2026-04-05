/** Canonical order for application setups (admin, API payload, and detail page). */
export const APPLICATION_SETUP_TYPE_ORDER = [
  "website",
  "playstore",
  "apk",
  "exe",
  "windows",
  "ios",
  "other",
] as const;

export type ApplicationSetupTypeKey = (typeof APPLICATION_SETUP_TYPE_ORDER)[number];

export function sortApplicationDownloadsList(list: unknown): any[] {
  const arr = Array.isArray(list) ? list : [];
  const rank = (t: string) => {
    const i = APPLICATION_SETUP_TYPE_ORDER.indexOf(t.toLowerCase() as ApplicationSetupTypeKey);
    return i === -1 ? 999 : i;
  };
  return [...arr]
    .sort((a: any, b: any) => rank(String(a?.type || "other")) - rank(String(b?.type || "other")))
    .map((d: any, i: number) => ({ ...d, order: i }));
}

export function defaultSetupLabelForType(type: string): string {
  const t = String(type || "other").toLowerCase();
  if (t === "website") return "Web";
  if (t === "playstore") return "Play Store";
  if (t === "apk") return "APK";
  if (t === "exe") return "Desktop";
  if (t === "windows") return "Windows";
  if (t === "ios") return "iOS";
  return "Other";
}
