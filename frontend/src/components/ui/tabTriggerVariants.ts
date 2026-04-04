import { cn } from "@/lib/utils";

/**
 * Shared tab trigger styles: same min-height for hover vs active, light hover tint, solid theme active.
 * Use with TabsTrigger `className={cnTabsTriggerPill()}` etc.
 */
const baseSize =
  "inline-flex items-center justify-center min-h-10 box-border px-4 py-2 text-sm font-medium leading-normal shadow-none transition-colors";

/** Rounded pills inside a tinted TabsList (admin modals, catalog admin). */
export function cnTabsTriggerPill(className?: string) {
  return cn(
    baseSize,
    "rounded-lg border-0 text-gray-600 bg-transparent",
    "hover:bg-[color-mix(in_srgb,var(--theme-primary)_18%,#f3f4f6)]",
    "data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=active]:hover:bg-[var(--theme-primary)]",
    className
  );
}

/** Top-rounded tabs above a divider (shop catalog detail, portfolio detail). Locked box model so active/hover match; `!` beats base TabsTrigger padding. Pair with TabsList `h-10` + `mb-*` + separate border row. */
export function cnTabsTriggerUnderline(className?: string) {
  return cn(
    "inline-flex !box-border !h-10 !min-h-10 !max-h-10 !shrink-0 !grow-0 self-stretch items-center justify-center px-5 text-sm font-medium !leading-5 !py-0 rounded-t-md rounded-b-none border-0 !shadow-none transition-colors",
    "text-gray-700 bg-transparent",
    "hover:bg-[color-mix(in_srgb,var(--theme-primary)_12%,#f5f3ff)]",
    "data-[state=active]:!bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=active]:hover:!bg-[var(--theme-primary)] data-[state=active]:!shadow-none",
    className
  );
}
