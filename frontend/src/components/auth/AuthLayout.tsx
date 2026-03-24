import React from "react";

/**
 * AuthLayout
 * Left column (360px): logo/brand
 * Right column (360px): form fields
 * Uses theme color for border and accents.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex justify-center items-center px-4"
      style={{
        backgroundImage: `url('/download.jpeg')`,
      }}
    >
      <div className="backdrop-blur-xl bg-white/10 border border-[var(--theme-primary,#A8734B)] shadow-2xl rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 w-full max-w-[960px]">
        {/* Left Logo Box (360px) */}
        <div className="w-full md:w-[360px] flex flex-col items-center justify-center gap-4 text-white">
          <div className="w-40 h-40 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide">Welcome to Veres</h1>
          <p className="text-sm text-white/80 text-center px-6">
            Handcrafted essentials with a touch of elegance.
          </p>
        </div>

        {/* Right Content (360px) */}
        <div className="w-full md:w-[360px] rounded-xl p-6 shadow-lg bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
