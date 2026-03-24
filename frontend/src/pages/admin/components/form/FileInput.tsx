import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label?: string;
  name?: string;
  register?: UseFormRegisterReturn | any;
  error?: string | undefined;
  accept?: string;
  className?: string;
};

export default function FileInput({ label, register, error, accept, className = "" }: Props) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input {...(register as any)} type="file" accept={accept} className="block w-full text-sm text-gray-700" />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
