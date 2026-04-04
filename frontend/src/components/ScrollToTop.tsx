import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll on client-side navigation (e.g. long landing → short page). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}
