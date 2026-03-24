/**
 * Spacing Utilities
 * 
 * Reusable spacing classes for consistent gaps and padding throughout the application.
 * All values are in pixels and can be used with Tailwind CSS classes.
 */

export const spacing = {
  // Section spacing (top and bottom padding for sections)
  section: {
    // Standard section gap - 20px top and bottom
    gap: "section-gap", // 20px top and bottom (custom utility class to override global section rule)
    
    // Alternative section gaps
    gapSmall: "py-3",   // 12px
    gapMedium: "section-gap",  // 20px (default)
    gapLarge: "py-8",    // 32px
    gapXLarge: "py-10",  // 40px
    gapXXLarge: "py-12", // 48px
    
    // Top only
    gapTop: "section-gap-top",     // 20px top
    gapTopSmall: "pt-3",   // 12px top
    gapTopMedium: "section-gap-top",  // 20px top
    gapTopLarge: "pt-8",   // 32px top
    gapTopXLarge: "pt-10",  // 40px top
    
    // Bottom only
    gapBottom: "section-gap-bottom",     // 20px bottom
    gapBottomSmall: "pb-3",   // 12px bottom
    gapBottomMedium: "section-gap-bottom",  // 20px bottom
    gapBottomLarge: "pb-8",   // 32px bottom
    gapBottomXLarge: "pb-10", // 40px bottom
  },

  // Container padding (left and right padding)
  container: {
    // Standard container padding
    padding: "px-4 sm:px-6 lg:px-8", // Responsive horizontal padding
    
    // Alternative container paddings
    paddingSmall: "px-3 sm:px-4 md:px-6",      // Smaller padding
    paddingMedium: "px-4 sm:px-6 lg:px-8",      // Medium padding (default)
    paddingLarge: "px-6 sm:px-8 lg:px-10",      // Larger padding
    paddingXLarge: "px-8",                     // 32px horizontal padding (left and right)
    
    // Left only
    paddingLeft: "pl-4 sm:pl-6 lg:pl-8",
    paddingLeftSmall: "pl-3 sm:pl-4 md:pl-6",
    paddingLeftLarge: "pl-6 sm:pl-8 lg:pl-10",
    paddingLeftXLarge: "pl-8",                // 32px left padding
    
    // Right only
    paddingRight: "pr-4 sm:pr-6 lg:pr-8",
    paddingRightSmall: "pr-3 sm:pr-4 md:pr-6",
    paddingRightLarge: "pr-6 sm:pr-8 lg:pr-10",
    paddingRightXLarge: "pr-8",               // 32px right padding
  },

  // Gap between elements (margin)
  gap: {
    // Vertical gaps
    vertical: "gap-5",        // 20px vertical gap
    verticalSmall: "gap-3",   // 12px
    verticalMedium: "gap-5",  // 20px
    verticalLarge: "gap-8",    // 32px
    
    // Horizontal gaps
    horizontal: "gap-5",        // 20px horizontal gap
    horizontalSmall: "gap-3",  // 12px
    horizontalMedium: "gap-5",  // 20px
    horizontalLarge: "gap-8",   // 32px
  },

  // Margin utilities
  margin: {
    // Top margins
    top: "mt-5",        // 20px top margin
    topSmall: "mt-3",   // 12px
    topMedium: "mt-5", // 20px
    topLarge: "mt-8",  // 32px
    
    // Bottom margins
    bottom: "mb-5",        // 20px bottom margin
    bottomSmall: "mb-3",  // 12px
    bottomMedium: "mb-5", // 20px
    bottomLarge: "mb-8",  // 32px
    
    // Left margins
    left: "ml-5",
    leftSmall: "ml-3",
    leftLarge: "ml-8",
    
    // Right margins
    right: "mr-5",
    rightSmall: "mr-3",
    rightLarge: "mr-8",
  },

  // Navbar offset (for fixed navbar - content padding to account for navbar height)
  navbar: {
    // Standard offset for fixed navbar (h-14 sm:h-16 = 56px/64px)
    offset: "pt-14 sm:pt-16", // Matches navbar height
    // Bottom gap - 20px bottom padding after navbar (used on pages, not in navbar itself)
    gapBottom: "navbar-gap-bottom", // Custom utility class with 20px bottom padding
  },

  // Footer gap (visible gap before footer with white background)
  footer: {
    // Standard footer gap - 10px top, 20px bottom with white background
    gap: "footer-gap",
    // Top only - 20px top padding with white background, no bottom padding
    gapTop: "footer-gap-top", // Custom utility class with !important to override global section rule
  },

  // Inner section spacing (for spacing within sections/components)
  inner: {
    // Standard inner section gap - 10px top and bottom
    gap: "inner-gap", // 10px top and bottom
    
    // Top only
    gapTop: "inner-gap-top", // 10px top
    gapTopSmall: "pt-1", // 4px top
    
    // Bottom only
    gapBottom: "inner-gap-bottom", // 10px bottom
    gapBottomSmall: "pb-1", // 4px bottom
    
    // Alternative inner gaps
    gapSmall: "py-1",   // 4px
    gapMedium: "inner-gap", // 10px (default)
    gapLarge: "py-2",   // 8px
  },
} as const;

/**
 * Helper function to combine spacing classes
 * @example combineSpacing(spacing.section.gap, spacing.container.padding)
 */
export const combineSpacing = (...classes: string[]): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Pre-defined common spacing combinations
 */
export const spacingCombos = {
  // Standard section with container padding
  sectionContainer: combineSpacing(spacing.section.gap, spacing.container.padding),
  
  // Section with no vertical gap but with container padding
  sectionContainerNoGap: combineSpacing(spacing.container.padding),
  
  // Large section gap with container padding
  sectionContainerLarge: combineSpacing(spacing.section.gapLarge, spacing.container.padding),
} as const;
