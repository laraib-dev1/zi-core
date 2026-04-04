import React from "react";
import { useLoader, LOADER_STYLES } from "@/context/LoaderContext";
import "./PageLoader.css";

export type PageLoaderVariant = "fullscreen" | "embedded";

interface PageLoaderProps {
  /** Override global loader message when provided */
  message?: string;
  /** `fullscreen` = fixed overlay (default). `embedded` = fills a bounded area inside a section. */
  variant?: PageLoaderVariant;
}

function SpinnerByStyle({
  styleId,
  customZipCss,
  loaderStyles,
}: {
  styleId: string;
  customZipCss?: string | null;
  loaderStyles: { id: string; spinnerClass: string }[];
}) {
  const option = loaderStyles.find((s) => s.id === styleId);
  const spinnerClass = option?.spinnerClass ?? "default";

  if (spinnerClass === "custom-zip" && customZipCss) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: customZipCss }} />
        <div className="loader-spinner loader-spinner-custom-zip" aria-hidden />
      </>
    );
  }

  if (spinnerClass === "default") {
    return <div className="loader" aria-hidden />;
  }

  const base = `loader-spinner loader-spinner-${spinnerClass}`;

  if (spinnerClass === "bars") {
    return (
      <div className={base} aria-hidden>
        <span className="loader-bar" />
        <span className="loader-bar" />
        <span className="loader-bar" />
      </div>
    );
  }
  if (spinnerClass === "dotted-circle") {
    return (
      <div className={base} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="loader-dot" />
        ))}
      </div>
    );
  }
  if (spinnerClass === "dots-horizontal") {
    return (
      <div className={base} aria-hidden>
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>
    );
  }
  if (spinnerClass === "dots-grid") {
    return (
      <div className={base} aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="loader-dot" />
        ))}
      </div>
    );
  }

  return <div className={base} aria-hidden />;
}

function LoaderBody({
  message,
  styleId,
  customZipCss,
  loaderStylesList,
  displayMode,
}: {
  message: string;
  styleId: string;
  customZipCss: string | null;
  loaderStylesList: { id: string; spinnerClass: string }[];
  displayMode: "both" | "message_only" | "spinner_only";
}) {
  const showMessage = displayMode === "both" || displayMode === "message_only";
  const showSpinner = displayMode === "both" || displayMode === "spinner_only";
  const effectiveStyleId = styleId || "default";
  const displayMessage = (message && message.trim()) || "...";
  const letters = displayMessage.split("");

  return (
    <div className="loader-wrapper">
      {showSpinner && (
        <SpinnerByStyle styleId={effectiveStyleId} customZipCss={customZipCss} loaderStyles={loaderStylesList} />
      )}
      {showMessage && (
        <div className="loader-text">
          {letters.map((letter, index) => (
            <span key={index} className="loader-letter">
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageLoader({ message: messageProp, variant = "fullscreen" }: PageLoaderProps) {
  const loader = useLoader();
  const message = messageProp ?? loader?.loaderMessage ?? "Loading...";
  const styleId = loader?.loaderStyleId ?? "default";
  const customZipCss = loader?.customZipCss ?? null;
  const loaderStylesList = loader?.loaderStyles ?? LOADER_STYLES;
  const displayMode = loader?.loaderDisplayMode ?? "both";

  const body = (
    <LoaderBody
      message={message}
      styleId={styleId}
      customZipCss={customZipCss}
      loaderStylesList={loaderStylesList}
      displayMode={displayMode}
    />
  );

  if (variant === "embedded") {
    return (
      <div
        className="relative w-full min-h-[min(50vh,360px)] rounded-xl overflow-hidden"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="absolute inset-0 bg-black z-[5] flex items-center justify-center">{body}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" aria-busy="true" aria-live="polite">
      {body}
    </div>
  );
}
