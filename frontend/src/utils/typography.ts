/**
 * Typography Utilities
 * 
 * Reusable text size and typography classes for consistent text styling throughout the application.
 * All classes use Tailwind CSS typography utilities.
 */

export const typography = {
  // Page Headings (largest headings, typically h1)
  pageHeading: {
    // Main page title
    default: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold",
    // Alternative sizes
    small: "text-2xl sm:text-3xl md:text-4xl font-bold",
    medium: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold",
    large: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold",
  },

  // Section Headings (h2, typically used for section titles)
  sectionHeading: {
    // Standard section heading
    default: "text-xl sm:text-2xl md:text-3xl font-semibold",
    // Alternative sizes
    small: "text-lg sm:text-xl md:text-2xl font-semibold",
    medium: "text-xl sm:text-2xl md:text-3xl font-semibold",
    large: "text-2xl sm:text-3xl md:text-4xl font-semibold",
  },

  // Hero Banner Text (for hero sections)
  hero: {
    // Hero title
    title: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-tight",
    // Hero subtitle
    subtitle: "text-sm sm:text-base md:text-lg lg:text-xl text-gray-600",
    // Hero description
    description: "text-xs sm:text-sm md:text-base text-gray-500",
  },

  // Card Text (for product cards, feature cards, etc.)
  card: {
    // Card title
    title: "text-base sm:text-lg md:text-xl font-semibold",
    // Card subtitle
    subtitle: "text-sm sm:text-base text-gray-600",
    // Card description
    description: "text-xs sm:text-sm text-gray-500",
    // Card price
    price: "text-lg sm:text-xl md:text-2xl font-bold",
    // Card small text (labels, badges)
    small: "text-xs sm:text-sm text-gray-400",
  },

  // Footer Text
  footer: {
    // Footer heading
    heading: "text-base sm:text-lg font-semibold text-white",
    // Footer link
    link: "text-sm sm:text-base text-gray-300 hover:text-white",
    // Footer copyright
    copyright: "text-xs sm:text-sm text-gray-400",
    // Footer brand name
    brand: "text-xl sm:text-2xl font-serif font-semibold text-white",
  },

  // Info Text (for informational sections, descriptions)
  info: {
    // Info heading
    heading: "text-lg sm:text-xl font-semibold",
    // Info text
    text: "text-sm sm:text-base text-gray-600",
    // Info small text
    small: "text-xs sm:text-sm text-gray-500",
    // Info large text (for emphasis)
    large: "text-base sm:text-lg md:text-xl text-gray-700",
  },

  // Body Text (general paragraph text)
  body: {
    // Standard body text
    default: "text-sm sm:text-base text-gray-700",
    // Small body text
    small: "text-xs sm:text-sm text-gray-600",
    // Large body text
    large: "text-base sm:text-lg text-gray-700",
  },

  // Button Text
  button: {
    // Standard button text
    default: "text-sm sm:text-base font-medium",
    // Small button text
    small: "text-xs sm:text-sm font-medium",
    // Large button text
    large: "text-base sm:text-lg font-semibold",
  },

  // Label Text
  label: {
    // Form labels
    default: "text-sm sm:text-base font-medium text-gray-700",
    // Small labels
    small: "text-xs sm:text-sm font-medium text-gray-600",
  },
} as const;

/**
 * Helper function to combine typography classes
 * @example combineTypography(typography.sectionHeading.default, "theme-heading")
 */
export const combineTypography = (...classes: string[]): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Pre-defined common typography combinations
 */
export const typographyCombos = {
  // Page heading with theme color
  pageHeadingTheme: combineTypography(
    typography.pageHeading.default,
    "theme-heading"
  ),
  
  // Section heading with theme color
  sectionHeadingTheme: combineTypography(
    typography.sectionHeading.default,
    "theme-heading"
  ),
  
  // Hero title with theme color
  heroTitleTheme: combineTypography(
    typography.hero.title,
    "theme-heading"
  ),
  
  // Card title with theme color
  cardTitleTheme: combineTypography(
    typography.card.title,
    "theme-heading"
  ),
} as const;
