/**
 * Sections backed by catalog grids or dynamic tiles. Labels may be edited in DB,
 * but SpFolio does not offer HTML override for these (same rule as catalog-* sections).
 */
export function isCatalogStyleLandingSectionId(sectionId: string): boolean {
  if (sectionId.startsWith("catalog-")) return true;
  return ["services", "portfolio", "courses", "applications"].includes(sectionId);
}
