// frontend/src/components/form/Input.tsx
import React from "react";
import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label?: string;
  register?: UseFormRegisterReturn; // react-hook-form register return
  error?: string;
  className?: string; // container / extra classes
} & InputHTMLAttributes<HTMLInputElement>; // includes name, type, value, onChange, placeholder, etc.

export default function Input({
  label,
  register,
  error,
  className = "",
  // all other standard input props come through rest
  ...rest
}: Props) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}

      {/* Spread register props first, then rest to allow explicit props to override if needed */}
      <input
        {...(register as any)} // cast to any here to avoid typing conflicts when spreading
        {...rest}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        style={{
          ...(rest.style as any),
          ...(error ? {} : {
            '--focus-ring': 'var(--theme-primary)',
            '--focus-border': 'var(--theme-primary)',
          })
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "var(--theme-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
          }
          rest.onFocus?.(e as any);
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }
          rest.onBlur?.(e as any);
        }}
      />

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
