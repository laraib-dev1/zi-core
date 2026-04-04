import React from "react";
import { Quote, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps {
  avatarSrc?: string;
  name: string;
  location: string;
  text: string;
  rating?: number;
  className?: string;
}

export default function TestimonialCard({
  avatarSrc,
  name,
  location,
  text,
  rating,
  className,
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col h-full rounded-lg border border-[#e8e0d8] bg-[#f8f6f4] p-4 text-center",
        className
      )}
    >
      {/* Profile at top center */}
      <div className="flex justify-center mb-2">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={name}
            className="w-16 h-16 rounded-full object-cover bg-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8" aria-hidden />
          </div>
        )}
      </div>

      <h3 className="text-base font-bold mb-0.5" style={{ color: "var(--theme-primary, #8B5E3C)" }}>{name}</h3>
      <p className="text-sm text-gray-500 mb-2">{location}</p>

      {/* Quote icon + text on same line */}
      <div className="flex gap-2 items-start text-left mb-2 flex-1 min-h-0">
        <Quote
          className="w-5 h-5 shrink-0 mt-0.5 scale-x-[-1]"
          style={{ color: "var(--theme-primary, #8B5E3C)", fill: "var(--theme-primary, #8B5E3C)" }}
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      </div>

      {/* Star rating at bottom */}
      {rating !== undefined && rating > 0 && (
        <div
          className="flex justify-center gap-1"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "text-lg",
                i < rating ? "text-amber-500" : "text-gray-300"
              )}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
