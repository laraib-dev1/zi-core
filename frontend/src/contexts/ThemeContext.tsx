import React, { createContext, useContext, useEffect, useState } from "react";
import { getCompany } from "@/api/company.api";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";

interface BrandTheme {
  primary: string;
  accent: string;
  dark: string;
  light: string;
}

interface ThemeContextType {
  theme: BrandTheme | null;
  updateTheme: (theme: BrandTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToRoot(brandTheme: BrandTheme) {
  const root = document.documentElement;
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
  };
  const primaryRgb = hexToRgb(brandTheme.primary);
  const darkRgb = hexToRgb(brandTheme.dark);
  const lightRgb = hexToRgb(brandTheme.light);
  const accentRgb = hexToRgb(brandTheme.accent);
  if (primaryRgb) {
    root.style.setProperty("--theme-primary", brandTheme.primary);
    root.style.setProperty("--theme-primary-rgb", primaryRgb);
  }
  if (darkRgb) {
    root.style.setProperty("--theme-dark", brandTheme.dark);
    root.style.setProperty("--theme-dark-rgb", darkRgb);
  }
  if (lightRgb) {
    root.style.setProperty("--theme-light", brandTheme.light);
    root.style.setProperty("--theme-light-rgb", lightRgb);
  }
  if (accentRgb) {
    root.style.setProperty("--theme-accent", brandTheme.accent);
    root.style.setProperty("--theme-accent-rgb", accentRgb);
  }
}

// Apply cached theme BEFORE first paint to prevent color blink
(function applyCachedThemeSync() {
  try {
    const cached = getCachedData<{ brandTheme?: BrandTheme }>(CACHE_KEYS.COMPANY);
    if (cached?.brandTheme) {
      applyThemeToRoot(cached.brandTheme);
    }
  } catch {
    /* ignore */
  }
})();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<BrandTheme | null>(() => {
    const cached = getCachedData<{ brandTheme?: BrandTheme }>(CACHE_KEYS.COMPANY);
    return cached?.brandTheme ?? null;
  });

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const cached = getCachedData<any>(CACHE_KEYS.COMPANY);
      if (cached?.brandTheme) {
        applyThemeToRoot(cached.brandTheme);
        setTheme(cached.brandTheme);
      }
      const company = await getCompany();
      if (company) {
        setCachedData(CACHE_KEYS.COMPANY, company);
        if (company.brandTheme) {
          applyThemeToRoot(company.brandTheme);
          setTheme(company.brandTheme);
        }
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  const updateTheme = (newTheme: BrandTheme) => {
    applyThemeToRoot(newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};





















