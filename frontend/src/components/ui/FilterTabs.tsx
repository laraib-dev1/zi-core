import React, { useRef, useEffect, useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function FilterTabs({ tabs, activeTab, onTabChange, className = "" }: FilterTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const updateIndicator = () => {
    const el = tabRefs.current[activeIndex];
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex, tabs.length]);

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-2 flex-wrap rounded-lg bg-transparent p-1 ${className}`}
    >
      {/* Sliding pill - animates to active tab */}
      <div
        className="absolute top-1 bottom-1 rounded-md pointer-events-none"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "var(--theme-primary, #8B5E3C)",
          zIndex: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      />
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            type="button"
            className={`relative z-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium border transition-colors duration-200 ${
              isActive
                ? "text-white border-transparent"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_15%,white)] hover:border-[color-mix(in_srgb,var(--theme-primary,#8B5E3C)_40%,#e5e7eb)]"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
