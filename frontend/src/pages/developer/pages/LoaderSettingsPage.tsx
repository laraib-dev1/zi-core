import React, { useState, useRef, useEffect } from "react";
import { useLoader } from "@/context/LoaderContext";
import PageLoader from "@/components/ui/PageLoader";
import "@/components/ui/PageLoader.css";
import JSZip from "jszip";
import { Loader2, Check, Upload, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Mini preview of a spinner style */
function LoaderStylePreview({ spinnerClass }: { spinnerClass: string }) {
  if (spinnerClass === "default") {
    return (
      <div
        className="w-8 h-8 rounded-full opacity-90"
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--theme-primary), transparent 70%)`,
          animation: "loader-pulse 1.2s ease-in-out infinite",
        }}
      />
    );
  }
  if (spinnerClass === "custom-zip") {
    return (
      <div className="w-10 h-10 rounded-full border-2 border-(--theme-primary) border-dashed flex items-center justify-center">
        <span className="text-xs text-gray-500">Zip</span>
      </div>
    );
  }
  const base = `loader-spinner loader-spinner-${spinnerClass}`;
  const isBars = spinnerClass === "bars";
  const isDottedCircle = spinnerClass === "dotted-circle";
  const isDotsH = spinnerClass === "dots-horizontal";
  const isDotsGrid = spinnerClass === "dots-grid";

  return (
    <div className="w-10 h-10 flex items-center justify-center [&_.loader-spinner]:text-[28px]! [&_.loader-spinner-solid-circle::before]:w-4! [&_.loader-spinner-solid-circle::before]:h-4! [&_.loader-spinner-dotted-circle]:text-[26px]! [&_.loader-spinner-pinwheel]:text-[28px]!">
      <div className={base} style={{ position: "relative" }}>
        {isBars && (
          <>
            <span className="loader-bar" />
            <span className="loader-bar" />
            <span className="loader-bar" />
          </>
        )}
        {isDottedCircle && Array.from({ length: 8 }, (_, i) => <span key={i} className="loader-dot" />)}
        {isDotsH && (
          <>
            <span className="loader-dot" />
            <span className="loader-dot" />
            <span className="loader-dot" />
          </>
        )}
        {isDotsGrid && Array.from({ length: 9 }, (_, i) => <span key={i} className="loader-dot" />)}
      </div>
    </div>
  );
}

export default function LoaderSettingsPage() {
  const loaderContext = useLoader();
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipSuccess, setZipSuccess] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!loaderContext) {
    return (
      <div className="p-6 text-gray-500">Loader settings require the app to be wrapped with LoaderProvider.</div>
    );
  }

  const {
    loaderMessage,
    loaderStyleId,
    presetId,
    useCustomMessage,
    customMessage,
    setPresetId,
    setCustomMessage,
    setLoaderStyleId,
    setLoaderDisplayMode,
    save,
    addCustomZipStyle,
    removeCustomZipStyle,
    loaderDisplayMode,
    messagePresets,
    loaderStyles,
    customZipCss,
  } = loaderContext;

  const [previewing, setPreviewing] = useState(false);
  const [showZipInstructions, setShowZipInstructions] = useState(false);

  /** Snapshot of loader state when page was opened or when user last clicked Update */
  const [lastSaved, setLastSaved] = useState<{
    presetId: string;
    useCustomMessage: boolean;
    customMessage: string;
    loaderStyleId: string;
    loaderDisplayMode: string;
    customZipCss: string | null;
    customZipLabel: string | null;
  } | null>(null);

  useEffect(() => {
    if (!loaderContext) return;
    setLastSaved({
      presetId,
      useCustomMessage,
      customMessage,
      loaderStyleId,
      loaderDisplayMode,
      customZipCss: loaderContext.customZipCss ?? null,
      customZipLabel: loaderContext.customZipLabel ?? null,
    });
  }, []);

  /** Display mode is written to localStorage immediately in LoaderContext; keep snapshot in sync so "Update" is not stuck showing for that toggle alone. */
  useEffect(() => {
    setLastSaved((prev) => (prev ? { ...prev, loaderDisplayMode } : prev));
  }, [loaderDisplayMode]);

  const hasChanges =
    lastSaved != null &&
    (presetId !== lastSaved.presetId ||
      useCustomMessage !== lastSaved.useCustomMessage ||
      customMessage !== lastSaved.customMessage ||
      loaderStyleId !== lastSaved.loaderStyleId ||
      loaderDisplayMode !== lastSaved.loaderDisplayMode ||
      (loaderContext?.customZipCss ?? null) !== lastSaved.customZipCss ||
      (loaderContext?.customZipLabel ?? null) !== lastSaved.customZipLabel);

  const handleUpdate = () => {
    save();
    setLastSaved({
      presetId,
      useCustomMessage,
      customMessage,
      loaderStyleId,
      loaderDisplayMode,
      customZipCss: loaderContext?.customZipCss ?? null,
      customZipLabel: loaderContext?.customZipLabel ?? null,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const showPreview = () => {
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 2500);
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (zipInputRef.current) zipInputRef.current.value = "";
    setZipError(null);
    setZipSuccess(false);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setZipError("Please select a .zip file.");
      return;
    }
    try {
      const zip = await JSZip.loadAsync(file);
      const cssEntry = Object.keys(zip.files).find((n) => n.toLowerCase().endsWith(".css"));
      if (!cssEntry) {
        setZipError("Zip must contain at least one .css file.");
        return;
      }
      const cssContent = await zip.files[cssEntry].async("string");
      const label = file.name.replace(/\.zip$/i, "");
      addCustomZipStyle(cssContent, label);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "Failed to read zip.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold theme-heading mb-1">Loader settings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={handleZipChange}
            className="hidden"
            id="loader-zip-input"
          />
          {hasChanges && (
            <button
              type="button"
              onClick={handleUpdate}
              className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition gap-2 inline-flex items-center border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark) hover:opacity-90"
            >
              <Save className="w-4 h-4" />
              {savedFeedback ? "Saved" : "Update"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowZipInstructions(true)}
            className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition gap-2 inline-flex items-center border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
          >
            <Upload className="w-4 h-4" />
            Choose zip file
          </button>
          <Dialog open={showZipInstructions} onOpenChange={setShowZipInstructions}>
            <DialogContent className="max-w-xl bg-white">
              <DialogHeader>
                <DialogTitle>How to add a custom spinner from a zip file</DialogTitle>
                <DialogDescription asChild>
                  <div className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-3 pt-2">
                    <p><strong>1. What to put in the zip file</strong></p>
                    <p>Your zip file must contain at least one <strong>.css</strong> file (e.g. <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">spinner.css</code> or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">loader.css</code>). The app will use the first .css file it finds inside the zip.</p>

                    <p><strong>2. What to put in the CSS file</strong></p>
                    <p>Your CSS should style the class <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.loader-spinner-custom-zip</code>. The loader is an empty div with that class, so use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">::before</code> or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">::after</code> to draw your animation. Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">var(--theme-primary)</code> for the color so it matches your theme.</p>

                    <p><strong>3. Example (spinning ring)</strong></p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">{`.loader-spinner-custom-zip { font-size: 48px; }
.loader-spinner-custom-zip::before {
  content: "";
  position: absolute;
  width: 1em; height: 1em;
  border: 0.15em solid transparent;
  border-top-color: var(--theme-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }`}</pre>

                    <p><strong>4. After uploading</strong></p>
                    <p>Select the new option (e.g. &quot;From zip&quot;) in the Spinner style list above, then click <strong>Save</strong> to use it on all pages.</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowZipInstructions(false);
                    setTimeout(() => zipInputRef.current?.click(), 100);
                  }}
                  className="rounded-lg border-2 px-4 py-2 text-sm font-medium inline-flex items-center gap-2 border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark) hover:opacity-90"
                >
                  <Upload className="w-4 h-4" />
                  Choose zip file
                </button>
                <button
                  type="button"
                  onClick={() => setShowZipInstructions(false)}
                  className="rounded-lg border-2 px-4 py-2 text-sm font-medium border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
                >
                  Cancel
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <button
            type="button"
            onClick={showPreview}
            className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition gap-2 inline-flex items-center border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
          >
            <Loader2 className="w-4 h-4" />
            Preview loader
          </button>
          {savedFeedback && (
            <span className="text-sm text-(--theme-accent)">Loader set for all pages.</span>
          )}
        </div>
      </div>

      {/* Loader shows: Message only / Spinner only / Both */}
      <section className="mb-8">
        <h2 className="text-lg font-medium theme-heading mb-3">Loader shows</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose what the full-page loader displays: only the message text, only the spinner, or both together.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setLoaderDisplayMode("both")}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
              loaderDisplayMode === "both"
                ? "border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark)"
                : "border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
            }`}
          >
            Both (message + spinner)
          </button>
          <button
            type="button"
            onClick={() => setLoaderDisplayMode("message_only")}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
              loaderDisplayMode === "message_only"
                ? "border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark)"
                : "border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
            }`}
          >
            Message only
          </button>
          <button
            type="button"
            onClick={() => setLoaderDisplayMode("spinner_only")}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
              loaderDisplayMode === "spinner_only"
                ? "border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark)"
                : "border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
            }`}
          >
            Spinner only
          </button>
        </div>
      </section>

      {/* Loader message – pick one (click again to deselect) */}
      <section className="mb-8">
        <h2 className="text-lg font-medium theme-heading mb-3">Loader message</h2>
        {/* <p className="text-sm text-gray-500 mb-4">
          Pick one message. Click the selected card again to deselect. When none selected, &quot;Loading...&quot; is used.
        </p> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {messagePresets.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPresetId(isSelected ? "" : preset.id)}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition
                  ${isSelected
                    ? "border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark)"
                    : "border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
                  }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-(--theme-dark)/20"
                >
                  <Loader2 className="w-5 h-5 text-(--theme-dark)" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{preset.label}</div>
                  <div className="text-sm truncate opacity-90">
                    {preset.isCustom ? (customMessage || "Your text") : preset.message}
                  </div>
                  {preset.description && (
                    <div className="text-xs mt-0.5 opacity-80">{preset.description}</div>
                  )}
                </div>
                {isSelected && <Check className="w-5 h-5 shrink-0 text-(--theme-dark)" />}
              </button>
            );
          })}
        </div>
        {useCustomMessage && (
          <div className="mt-4 max-w-md">
            <Label htmlFor="custom-loader-msg">Custom message text</Label>
            <Input
              id="custom-loader-msg"
              type="text"
              placeholder="e.g. My Brand"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-2"
            />
          </div>
        )}
      </section>

      {/* Spinner style – pick one (click again to deselect) */}
      <section className="mb-8">
        <h2 className="text-lg font-medium theme-heading mb-3 pt-8">Spinner style</h2>
        {/* <p className="text-sm text-gray-500 mb-4">
          Pick one spinner. Click the selected card again to deselect. When none selected, no spinner is shown (if &quot;Loader shows&quot; is Both or Spinner only).
        </p>  */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-4">
          {loaderStyles.map((style) => {
            const isSelected = loaderStyleId === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setLoaderStyleId(isSelected ? "" : style.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition
                  ${isSelected
                    ? "border-(--theme-accent) bg-(--theme-accent) text-(--theme-dark)"
                    : "border-(--theme-dark) bg-(--theme-dark) text-white hover:opacity-90"
                  }`}
              >
                <LoaderStylePreview spinnerClass={style.spinnerClass} />
                <span className="text-sm font-medium truncate w-full text-center">{style.label}</span>
                {style.description && (
                  <span className="text-xs truncate w-full text-center opacity-90">{style.description}</span>
                )}
                {isSelected && <Check className="w-4 h-4 text-(--theme-dark) shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Add spinner style (zip) */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {customZipCss && (
            <button
              type="button"
              onClick={removeCustomZipStyle}
              className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition gap-2 inline-flex items-center border-(--theme-dark) bg-(--theme-dark) text-red-200 hover:opacity-90"
            >
              <Trash2 className="w-4 h-4" />
              Remove zip style
            </button>
          )}
          {zipError && <span className="text-sm text-red-600">{zipError}</span>}
          {zipSuccess && <span className="text-sm text-green-600">Spinner style added. Select it above and click Save.</span>}
        </div>
      </section>

      <p className="text-sm text-gray-500 mt-6">
        Current: shows <strong className="theme-heading">{loaderDisplayMode === "both" ? "Both" : loaderDisplayMode === "message_only" ? "Message only" : "Spinner only"}</strong>.
        {" "}Message: <strong className="theme-heading">&quot;{loaderMessage || "(none)"}&quot;</strong>
        {loaderStyleId ? <>; Spinner: <strong className="theme-heading">{loaderStyles.find((s) => s.id === loaderStyleId)?.label ?? loaderStyleId}</strong></> : " (none)"}. Click Save to apply.
      </p>

      {previewing && <PageLoader message={loaderMessage || "..."} />}
    </div>
  );
}
