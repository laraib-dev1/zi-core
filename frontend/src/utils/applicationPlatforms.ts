/** Order matches admin Setups tab (website → apk → exe → windows). */
const TYPE_ORDER = ["website", "apk", "exe", "windows", "ios", "other"] as const;

const TYPE_LABEL: Record<string, string> = {
  website: "Web",
  apk: "App",
  ios: "App",
  exe: "Desktop",
  windows: "Windows",
};

/**
 * Pipe-separated platform line for tiles (e.g. "Web | App | Windows") from enabled downloadsList entries.
 */
export function getApplicationPlatformStatesLine(downloadsList: unknown): string {
  const list = Array.isArray(downloadsList) ? downloadsList : [];
  const enabled = list.filter((x: any) => x?.enabled !== false);
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const typeKey of TYPE_ORDER) {
    const item = enabled.find((d: any) => String(d?.type || "other").toLowerCase() === typeKey);
    if (!item) continue;
    let lab =
      typeKey === "other"
        ? String(item.label || "").trim() || "Other"
        : TYPE_LABEL[typeKey] || String(item.label || typeKey).trim() || typeKey;
    if (typeKey === "apk" || typeKey === "ios") lab = "App";
    if (seen.has(lab)) continue;
    seen.add(lab);
    labels.push(lab);
  }

  return labels.join(" | ");
}

export type ApplicationPlatformNavEntry = { label: string; href: string };

/**
 * One entry per visible platform label (e.g. Web, App) linking to the public app detail URL.
 */
export function getApplicationPlatformNavEntries(
  downloadsList: unknown,
  catalogTypeSlug: string,
  applicationId: string
): ApplicationPlatformNavEntry[] {
  const list = Array.isArray(downloadsList) ? downloadsList : [];
  const enabled = list.filter((x: any) => x?.enabled !== false);
  const out: ApplicationPlatformNavEntry[] = [];
  const seen = new Set<string>();
  const base = `/catalog/${catalogTypeSlug}/${applicationId}`;

  for (const typeKey of TYPE_ORDER) {
    const item = enabled.find((d: any) => String(d?.type || "other").toLowerCase() === typeKey);
    if (!item) continue;
    let lab =
      typeKey === "other"
        ? String(item.label || "").trim() || "Other"
        : TYPE_LABEL[typeKey] || String(item.label || typeKey).trim() || typeKey;
    if (typeKey === "apk" || typeKey === "ios") lab = "App";
    if (seen.has(lab)) continue;
    seen.add(lab);
    out.push({ label: lab, href: base });
  }

  return out;
}
