import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onFocus, onBlur, ...props }, ref) => {
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--theme-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.boxShadow = "";
    onBlur?.(e);
  };
  
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-black",
        className
      )}
      style={{ borderColor: "#d1d5db" }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
