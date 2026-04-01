/** Public URL for a catalog item (matches landing CatalogSection links). */
export function getCatalogItemPublicPath(catalogTypeSlug: string, itemId: string): string {
  const s = String(catalogTypeSlug || "").toLowerCase();
  if (s === "blog") return `/blog/${itemId}`;
  if (s === "projects") return `/project/${itemId}`;
  if (s === "services") return `/service/${itemId}`;
  if (s === "courses") return `/course/${itemId}`;
  if (s === "applications" || s === "apps" || s === "websites") return `/catalog/${s}/${itemId}`;
  return `/catalog/${s}/${itemId}`;
}
