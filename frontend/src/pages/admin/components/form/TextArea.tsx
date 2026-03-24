import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label?: string;
  name?: string;
  register?: UseFormRegisterReturn | any;
  error?: string | undefined;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export default function TextArea({
  label,
  register,
  error,
  placeholder,
  rows = 4,
  className = "",
}: Props) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <textarea
        {...(register as any)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none ${error ? "border-red-500" : "border-gray-300"}`}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "var(--theme-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }
        }}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
