import axios from "axios";

function cleanEnvValue(value: string): string {
  return String(value || "")
    .replace(/\\n/g, "")
    .replace(/\r?\n/g, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

const urls = cleanEnvValue(import.meta.env.VITE_API_URLS || "")
  .split(",")
  .map((url: string) => cleanEnvValue(url))
  .filter(Boolean);

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Localhost → use first URL (local API). Vercel/production → use second URL (production API). Fallback to first if only one URL set.
const rawApiUrl = isLocalhost
  ? urls[0]
  : (urls[1] || urls[0] || cleanEnvValue(import.meta.env.VITE_API_URL || ""));

function ensureApiPath(url: string): string {
  const trimmed = (url || "").trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const API_URL = ensureApiPath(rawApiUrl);
const FALLBACK_API_URL = ensureApiPath(urls[1] || "");
const canFallbackFromLocal = isLocalhost && Boolean(FALLBACK_API_URL) && FALLBACK_API_URL !== API_URL;

console.log("API Base URL:", API_URL); // debug

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // For FormData requests, remove Content-Type header to let axios set it automatically with boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to suppress 401 errors in console for unauthenticated requests
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error?.config as (any | undefined);
    const errorCode = String(error?.code || "");
    const isNetworkRefused =
      errorCode === "ERR_NETWORK" ||
      errorCode === "ECONNREFUSED" ||
      String(error?.message || "").toLowerCase().includes("network error");

    if (canFallbackFromLocal && isNetworkRefused && originalConfig && !originalConfig.__fallbackRetried) {
      originalConfig.__fallbackRetried = true;
      originalConfig.baseURL = FALLBACK_API_URL;
      return API.request(originalConfig);
    }

    // Suppress 401 errors completely - they're expected when user is not logged in or token expired
    if (error?.response?.status === 401) {
      // Create a silent error that won't trigger console logs
      const silentError = new Error('Unauthorized');
      silentError.name = 'SilentError';
      // Mark it so we can identify it
      (silentError as any).isSilent = true;
      return Promise.reject(silentError);
    }
    // For other errors, let them through normally
    return Promise.reject(error);
  }
);

// Override console methods to filter 401 errors - must be done early and aggressively
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Store original to restore if needed
  (window as any).__originalConsoleError = originalError;
  (window as any).__originalConsoleWarn = originalWarn;
  (window as any).__originalConsoleLog = originalLog;
  
  const shouldSuppress = (...args: any[]): boolean => {
    const allText = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    // Very aggressive filtering - catch any mention of 401 or Unauthorized
    return allText.includes('401') || 
           allText.includes('Unauthorized') ||
           allText.includes('user.api.ts') ||
           allText.includes('/api/user/') ||
           allText.includes('/api/orders/my-orders') ||
           allText.includes('GET http://localhost:3000/api/user/') ||
           allText.includes('GET http://localhost:3000/api/orders/my-orders');
  };
  
  // Override all console methods
  console.error = function(...args: any[]) {
    if (shouldSuppress(...args)) {
      return; // Silently ignore 401 errors
    }
    originalError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    if (shouldSuppress(...args)) {
      return; // Silently ignore 401 warnings
    }
    originalWarn.apply(console, args);
  };
  
  console.log = function(...args: any[]) {
    if (shouldSuppress(...args)) {
      return; // Silently ignore 401 logs
    }
    originalLog.apply(console, args);
  };
  
  // Also try to intercept XMLHttpRequest errors
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method: string, url: string, ...rest: any[]) {
      // Store method and url on xhr instance (using type assertion for custom properties)
      (this as any)._method = method;
      (this as any)._url = url;
      return originalOpen.apply(this, [method, url, ...rest] as any);
    };
    
    xhr.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const xhrInstance = this;
      xhrInstance.addEventListener('error', function(event: any) {
        // Suppress 401 errors
        if (xhrInstance.status === 401) {
          event.stopPropagation();
          event.preventDefault();
        }
      }, true);
      
      xhrInstance.addEventListener('load', function() {
        // Suppress 401 errors from being logged
        if (xhrInstance.status === 401) {
          // Don't let the error propagate
          return;
        }
      }, true);
      
      return originalSend.call(xhrInstance, body);
    };
    
    return xhr;
  } as any;
}

export default API;
