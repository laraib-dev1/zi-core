import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Option = {
  value: string | number;
  label: string;
};

type Props = {
  label?: string;
  name?: string;
  register?: UseFormRegisterReturn | any;
  error?: string | undefined;
  options: Option[];
  className?: string;
};

export default function Select({ label, register, error, options, className = "" }: Props) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select {...(register as any)} className={`w-full rounded-md border px-3 py-2 focus:outline-none ${error ? "border-red-500" : "border-gray-300"}`}>
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
