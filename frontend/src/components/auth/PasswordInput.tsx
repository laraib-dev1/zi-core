import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChange: any;
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-800 text-sm font-medium">{label}</label>

      <div className="relative">
       <input
  id={label}
  name="password"
  type={show ? "text" : "password"}
  autoComplete="current-password"
  value={value}
  placeholder={placeholder}
  onChange={onChange}
  className="w-full rounded-md bg-white/70 px-3 py-2 text-black focus:outline-none"
/>


        <button
          type="button"
          className="absolute right-3 top-2.5 text-black/60"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
