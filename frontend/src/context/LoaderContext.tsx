import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY_PRESET = "app_loader_preset";
const STORAGE_KEY_CUSTOM = "app_loader_custom_message";
const STORAGE_KEY_USE_CUSTOM = "app_loader_use_custom";
const STORAGE_KEY_STYLE = "app_loader_style";
const STORAGE_KEY_MODE = "app_loader_mode";
const STORAGE_KEY_DISPLAY_MODE = "app_loader_display_mode";
const STORAGE_KEY_CUSTOM_ZIP_CSS = "app_loader_custom_zip_css";
const STORAGE_KEY_CUSTOM_ZIP_LABEL = "app_loader_custom_zip_label";

export type LoaderMode = "both" | "single";
/** What to show on the full-page loader: only message, only spinner, or both. */
export type LoaderDisplayMode = "both" | "message_only" | "spinner_only";

/** Message loader – text shown under the spinner. Pick ONE. */
export interface LoaderMessagePreset {
  id: string;
  label: string;
  message: string;
  description?: string;
  isCustom?: boolean;
}

export const LOADER_MESSAGE_PRESETS: LoaderMessagePreset[] = [
  { id: "spfolio", label: "SpFolio", message: "SpFolio", description: "Brand default" },
  { id: "gracebyanu", label: "GraceByAnu", message: "GraceByAnu", description: "Alternate brand" },
  { id: "loading", label: "Loading...", message: "Loading...", description: "Generic" },
  { id: "please_wait", label: "Please wait...", message: "Please wait...", description: "Polite" },
  { id: "minimal", label: "Minimal", message: "...", description: "Just dots" },
  { id: "custom", label: "Custom", message: "", description: "Use your own text", isCustom: true },
];

/** Spinner loader – animation style. Pick ONE. Separate from message. */
export interface LoaderStyleOption {
  id: string;
  label: string;
  description?: string;
  spinnerClass: string;
}

export const LOADER_STYLES: LoaderStyleOption[] = [
  { id: "default", label: "Default", description: "Gradient mask", spinnerClass: "default" },
  { id: "arc", label: "Circular arc", description: "Spinning arc", spinnerClass: "arc" },
  { id: "arc-thin", label: "Thin arc", description: "Thinner spinning arc", spinnerClass: "arc-thin" },
  { id: "bars", label: "Vertical bars", description: "Equalizer style", spinnerClass: "bars" },
  { id: "solid-circle", label: "Solid circle", description: "Pulsing circle", spinnerClass: "solid-circle" },
  { id: "dotted-circle", label: "Dotted circle", description: "Dots on ring", spinnerClass: "dotted-circle" },
  { id: "dots-horizontal", label: "Horizontal dots", description: "Three dots", spinnerClass: "dots-horizontal" },
  { id: "dots-grid", label: "Dot grid", description: "3×3 grid", spinnerClass: "dots-grid" },
  { id: "pinwheel", label: "Pinwheel", description: "Quadrant circle", spinnerClass: "pinwheel" },
];

/** For "single" mode: one card = one loader (message + spinner). 14 options – pick only ONE. */
export interface LoaderOption {
  id: string;
  label: string;
  message: string;
  presetId: string;
  styleId: string;
  description?: string;
  isCustom?: boolean;
}

export const LOADER_OPTIONS: LoaderOption[] = [
  { id: "spfolio", label: "SpFolio", message: "SpFolio", presetId: "spfolio", styleId: "arc-thin", description: "Brand default" },
  { id: "gracebyanu", label: "GraceByAnu", message: "GraceByAnu", presetId: "gracebyanu", styleId: "default", description: "Alternate brand" },
  { id: "loading", label: "Loading...", message: "Loading...", presetId: "loading", styleId: "arc", description: "Generic" },
  { id: "please_wait", label: "Please wait...", message: "Please wait...", presetId: "please_wait", styleId: "bars", description: "Polite" },
  { id: "minimal", label: "Minimal", message: "...", presetId: "minimal", styleId: "dots-horizontal", description: "Just dots" },
  { id: "spfolio-default", label: "SpFolio (default)", message: "SpFolio", presetId: "spfolio", styleId: "default", description: "Brand, gradient" },
  { id: "spfolio-arc", label: "SpFolio (arc)", message: "SpFolio", presetId: "spfolio", styleId: "arc", description: "Brand, spinning arc" },
  { id: "gracebyanu-thin", label: "GraceByAnu (thin arc)", message: "GraceByAnu", presetId: "gracebyanu", styleId: "arc-thin", description: "Alternate, thin arc" },
  { id: "loading-bars", label: "Loading... (bars)", message: "Loading...", presetId: "loading", styleId: "bars", description: "Generic, equalizer" },
  { id: "please_wait-dots", label: "Please wait... (dots)", message: "Please wait...", presetId: "please_wait", styleId: "dots-horizontal", description: "Polite, three dots" },
  { id: "minimal-dotted", label: "Minimal (ring)", message: "...", presetId: "minimal", styleId: "dotted-circle", description: "Dots on ring" },
  { id: "spfolio-pinwheel", label: "SpFolio (pinwheel)", message: "SpFolio", presetId: "spfolio", styleId: "pinwheel", description: "Brand, pinwheel" },
  { id: "gracebyanu-solid", label: "GraceByAnu (pulse)", message: "GraceByAnu", presetId: "gracebyanu", styleId: "solid-circle", description: "Alternate, pulsing" },
  { id: "custom", label: "Custom", message: "", presetId: "custom", styleId: "arc-thin", description: "Use your own text", isCustom: true },
];

const CUSTOM_ZIP_STYLE_ID = "custom-zip";

interface LoaderContextValue {
  loaderMessage: string;
  loaderStyleId: string;
  presetId: string;
  useCustomMessage: boolean;
  customMessage: string;
  loaderMode: LoaderMode;
  loaderDisplayMode: LoaderDisplayMode;
  messagePresets: LoaderMessagePreset[];
  loaderStyles: LoaderStyleOption[];
  loaderOptions: LoaderOption[];
  customZipCss: string | null;
  customZipLabel: string | null;
  setPresetId: (id: string) => void;
  setUseCustomMessage: (use: boolean) => void;
  setCustomMessage: (msg: string) => void;
  setLoaderStyleId: (id: string) => void;
  setLoaderMode: (mode: LoaderMode) => void;
  setLoaderDisplayMode: (mode: LoaderDisplayMode) => void;
  setLoaderFromOption: (presetId: string, styleId: string, isCustom?: boolean) => void;
  addCustomZipStyle: (css: string, label: string) => void;
  removeCustomZipStyle: () => void;
  save: () => void;
}

const defaultPreset = LOADER_MESSAGE_PRESETS[0];
const defaultStyleId = LOADER_STYLES[0].id;

function getCustomZipStyle(css: string | null, label: string | null): LoaderStyleOption | null {
  if (!css || !css.trim()) return null;
  return {
    id: CUSTOM_ZIP_STYLE_ID,
    label: label && label.trim() ? label.trim() : "From zip",
    description: "Custom spinner from zip",
    spinnerClass: "custom-zip",
  };
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [presetId, setPresetIdState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultPreset.id;
    const stored = localStorage.getItem(STORAGE_KEY_PRESET);
    if (stored === null) return defaultPreset.id;
    if (stored === "") return "";
    return LOADER_MESSAGE_PRESETS.some((p) => p.id === stored) ? stored : defaultPreset.id;
  });
  const [useCustomMessage, setUseCustomMessageState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_USE_CUSTOM) === "1" || localStorage.getItem(STORAGE_KEY_USE_CUSTOM) === "true";
  });
  const [customMessage, setCustomMessageState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY_CUSTOM) || "";
  });
  const [loaderStyleId, setLoaderStyleIdState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultStyleId;
    const stored = localStorage.getItem(STORAGE_KEY_STYLE);
    if (stored === null) return defaultStyleId;
    if (stored === "") return "";
    if (stored === CUSTOM_ZIP_STYLE_ID && !localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_CSS)) return defaultStyleId;
    const valid = LOADER_STYLES.some((s) => s.id === stored) || (stored === CUSTOM_ZIP_STYLE_ID && localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_CSS));
    return valid ? stored! : defaultStyleId;
  });
  const [customZipCss, setCustomZipCssState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_CSS);
  });
  const [customZipLabel, setCustomZipLabelState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_LABEL);
  });
  const [loaderMode, setLoaderModeState] = useState<LoaderMode>(() => {
    if (typeof window === "undefined") return "both";
    const m = localStorage.getItem(STORAGE_KEY_MODE);
    return m === "single" ? "single" : "both";
  });
  const [loaderDisplayMode, setLoaderDisplayModeState] = useState<LoaderDisplayMode>(() => {
    if (typeof window === "undefined") return "both";
    const d = localStorage.getItem(STORAGE_KEY_DISPLAY_MODE);
    if (d === "message_only" || d === "spinner_only" || d === "both") return d;
    return "both";
  });

  const customZipStyle = getCustomZipStyle(customZipCss, customZipLabel);
  const loaderStylesWithZip = customZipStyle ? [...LOADER_STYLES, customZipStyle] : LOADER_STYLES;

  const loaderMessage = !presetId
    ? "Loading..."
    : useCustomMessage && customMessage.trim()
      ? customMessage.trim()
      : (LOADER_MESSAGE_PRESETS.find((p) => p.id === presetId) || defaultPreset).message || "Loading...";

  const save = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_PRESET, presetId);
    localStorage.setItem(STORAGE_KEY_USE_CUSTOM, useCustomMessage ? "1" : "0");
    localStorage.setItem(STORAGE_KEY_CUSTOM, customMessage);
    localStorage.setItem(STORAGE_KEY_STYLE, loaderStyleId);
    localStorage.setItem(STORAGE_KEY_MODE, loaderMode);
    localStorage.setItem(STORAGE_KEY_DISPLAY_MODE, loaderDisplayMode);
    if (customZipCss != null) localStorage.setItem(STORAGE_KEY_CUSTOM_ZIP_CSS, customZipCss);
    else localStorage.removeItem(STORAGE_KEY_CUSTOM_ZIP_CSS);
    if (customZipLabel != null) localStorage.setItem(STORAGE_KEY_CUSTOM_ZIP_LABEL, customZipLabel);
    else localStorage.removeItem(STORAGE_KEY_CUSTOM_ZIP_LABEL);
  }, [presetId, useCustomMessage, customMessage, loaderStyleId, loaderMode, loaderDisplayMode, customZipCss, customZipLabel]);

  const setLoaderDisplayMode = useCallback((mode: LoaderDisplayMode) => {
    setLoaderDisplayModeState(mode);
  }, []);

  const setLoaderMode = useCallback((mode: LoaderMode) => {
    setLoaderModeState(mode);
  }, []);

  const setLoaderFromOption = useCallback((presetIdFromOption: string, styleIdFromOption: string, isCustom?: boolean) => {
    setPresetIdState(presetIdFromOption);
    setLoaderStyleIdState(styleIdFromOption);
    setUseCustomMessageState(!!isCustom);
  }, []);

  const setPresetId = useCallback((id: string) => {
    if (id !== "" && !LOADER_MESSAGE_PRESETS.some((p) => p.id === id)) return;
    setPresetIdState(id);
    if (id === "custom") setUseCustomMessageState(true);
    else setUseCustomMessageState(false);
  }, []);

  const setUseCustomMessage = useCallback((use: boolean) => {
    setUseCustomMessageState(use);
  }, []);

  const setCustomMessage = useCallback((msg: string) => {
    setCustomMessageState(msg);
  }, []);

  const setLoaderStyleId = useCallback((id: string) => {
    if (id !== "" && !loaderStylesWithZip.some((s) => s.id === id)) return;
    setLoaderStyleIdState(id);
  }, [loaderStylesWithZip]);

  const addCustomZipStyle = useCallback((css: string, label: string) => {
    setCustomZipCssState(css);
    setCustomZipLabelState(label || "From zip");
  }, []);

  const removeCustomZipStyle = useCallback(() => {
    setCustomZipCssState(null);
    setCustomZipLabelState(null);
    setLoaderStyleIdState((prev) => (prev === CUSTOM_ZIP_STYLE_ID ? defaultStyleId : prev));
  }, []);

  useEffect(() => {
    if (loaderStyleId === CUSTOM_ZIP_STYLE_ID && !customZipCss?.trim()) {
      setLoaderStyleIdState(defaultStyleId);
    }
  }, [customZipCss, loaderStyleId]);

  /** Persist display mode immediately so spinner-only / message-only survives navigation and reload without clicking Save. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_DISPLAY_MODE, loaderDisplayMode);
    } catch {
      /* ignore quota / private mode */
    }
  }, [loaderDisplayMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith("app_loader_")) return;
      try {
        const style = localStorage.getItem(STORAGE_KEY_STYLE);
        const zip = localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_CSS);
        if (zip !== undefined) setCustomZipCssState(zip);
        const zipLabel = localStorage.getItem(STORAGE_KEY_CUSTOM_ZIP_LABEL);
        if (zipLabel !== undefined) setCustomZipLabelState(zipLabel);
        if (style != null && style !== "") {
          const validZip = style === CUSTOM_ZIP_STYLE_ID && !!zip?.trim();
          const validBuiltin = LOADER_STYLES.some((s) => s.id === style);
          if (validZip || validBuiltin) setLoaderStyleIdState(style);
          else if (style === CUSTOM_ZIP_STYLE_ID && !zip?.trim()) setLoaderStyleIdState(defaultStyleId);
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        loaderMessage,
        loaderStyleId,
        presetId,
        useCustomMessage,
        customMessage,
        loaderMode,
        loaderDisplayMode,
        messagePresets: LOADER_MESSAGE_PRESETS,
        loaderStyles: loaderStylesWithZip,
        loaderOptions: LOADER_OPTIONS,
        customZipCss,
        customZipLabel,
        setPresetId,
        setUseCustomMessage,
        setCustomMessage,
        setLoaderStyleId,
        setLoaderMode,
        setLoaderDisplayMode,
        setLoaderFromOption,
        addCustomZipStyle,
        removeCustomZipStyle,
        save,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader(): LoaderContextValue | null {
  return useContext(LoaderContext);
}
export const CUSTOM_ZIP_SPINNER_ID = CUSTOM_ZIP_STYLE_ID;

