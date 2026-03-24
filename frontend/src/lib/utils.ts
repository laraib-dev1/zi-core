import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Smooth scroll to element over a configurable duration (default 800ms) */
export function smoothScrollToElement(
  element: HTMLElement,
  options?: { duration?: number }
) {
  const duration = options?.duration ?? 800
  const navbarOffset = 80 // approximate fixed navbar height
  const rect = element.getBoundingClientRect()
  const targetY = window.scrollY + rect.top - navbarOffset
  const startY = window.scrollY
  const distance = targetY - startY
  const startTime = performance.now()

  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    window.scrollTo(0, startY + distance * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
