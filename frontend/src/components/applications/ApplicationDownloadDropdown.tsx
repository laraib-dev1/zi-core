import React, { useMemo, useState } from "react";

type DownloadItem = {
  type?: string;
  label?: string;
  url?: string;
  storageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
};

function toReadableSize(size?: number): string {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ApplicationDownloadDropdown({
  items,
}: {
  items: DownloadItem[];
}) {
  const [open, setOpen] = useState(false);
  const normalized = useMemo(
    () =>
      (items || []).filter((x) => Boolean(x?.url || x?.fileUrl || x?.storageUrl)).map((x) => ({
        ...x,
        type: (x.type || "other").toLowerCase(),
      })),
    [items]
  );

  if (!normalized.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md px-4 py-2 text-xs sm:text-sm font-medium text-white"
        style={{ backgroundColor: "var(--theme-primary)" }}
      >
        Get Latest Version
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 min-w-[260px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
          <div className="space-y-2">
            {normalized.map((item, idx) => {
              const href = item.storageUrl || item.fileUrl || item.url || "#";
              const meta = item.fileSize ? toReadableSize(item.fileSize) : "";
              return (
                <a
                  key={`${item.type}-${idx}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-800">{item.label || item.type || "Download"}</span>
                  <span className="text-xs text-gray-500">{meta}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
