/**
 * Cache utility for localStorage with expiration support
 */

const CACHE_PREFIX = 'app_cache_';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now > item.expiresAt) {
      // Remove expired cache
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    // Remove corrupted cache
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

/**
 * Set data in cache with expiration
 */
export function setCachedData<T>(
  key: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): void {
  try {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + duration,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
    // If storage is full, try to clear old caches
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearExpiredCaches();
      // Try again
      try {
        const now = Date.now();
        const item: CacheItem<T> = {
          data,
          timestamp: now,
          expiresAt: now + duration,
        };
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
      } catch (retryError) {
        console.error(`Failed to cache after cleanup:`, retryError);
      }
    }
  }
}

/**
 * Remove cached data
 */
export function removeCachedData(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing cache for ${key}:`, error);
  }
}

/**
 * Clear all expired caches
 */
export function clearExpiredCaches(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const item: CacheItem<any> = JSON.parse(cached);
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
              cleared++;
            }
          }
        } catch (error) {
          // Remove corrupted cache
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired cache entries`);
    }
  } catch (error) {
    console.error('Error clearing expired caches:', error);
  }
}

/**
 * Clear all caches (useful for logout or manual refresh)
 */
export function clearAllCaches(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all caches:', error);
  }
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(key: string): number | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const item: CacheItem<any> = JSON.parse(cached);
    return Date.now() - item.timestamp;
  } catch (error) {
    return null;
  }
}

// Cache keys
export const CACHE_KEYS = {
  COMPANY: 'company',
  FOOTER: 'footer',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  BLOGS: 'blogs',
  BLOG_CATEGORIES: 'blog_categories',
  BLOG_NICHES: 'blog_niches',
  BLOG_DETAIL: 'blog_detail',
  ENABLED_LANDING_SECTIONS: 'enabled_landing_sections',
  LANDING_SECTIONS: 'landing_sections',
  BANNERS2: 'banners2',
  ADMIN_TABS: 'admin_tabs',
  CATALOG_TYPES: 'catalog_types',
  LANDING_SECTIONS_FULL: 'landing_sections_full',
  ADMIN_TABS_FULL: 'admin_tabs_full',
  CATALOG_TYPES_FULL: 'catalog_types_full',
  FOOTER_CONFIG: 'footer_config',
  WEB_PAGES: 'web_pages',
  PROFILE_PAGES: 'profile_pages',
  ADMIN_CATEGORIES: 'admin_categories',
  ADMIN_SECTIONS_FULL: 'admin_sections_full',
  FOOTER_EDITOR: 'footer_editor',
} as const;
