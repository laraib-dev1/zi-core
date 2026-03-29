import React from "react";
import { useParams } from "react-router-dom";
import CatalogDetail from "@/pages/shop/CatalogDetail";

/**
 * Renders the same detail experience as `/catalog/blog/:id` for URLs like `/blog/:id`
 * (used by CatalogSection and navbar-friendly links).
 */
export default function BlogCatalogDetail() {
  const { id } = useParams<{ id: string }>();
  return <CatalogDetail typeOverride="blog" idOverride={id} />;
}
