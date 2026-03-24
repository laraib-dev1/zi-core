import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  ImageIcon,
  Settings,
  Cog,
  Building2,
  FileText,
  PanelBottom,
  Home,
  Store,
  Star,
  BookOpen,
  FileCheck,
  Info,
  Mail,
  Shield,
  Bell,
  Users,
  BarChart3,
  CreditCard,
  Truck,
  Search,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Map of icon names to icon components
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  ImageIcon,
  Settings,
  Cog,
  Building2,
  FileText,
  PanelBottom,
  Home,
  Store,
  Star,
  BookOpen,
  FileCheck,
  Info,
  Mail,
  Shield,
  Bell,
  Users,
  BarChart3,
  CreditCard,
  Truck,
  Search,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
};

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconNames = Object.keys(iconMap);
  const SelectedIcon = value && iconMap[value] ? iconMap[value] : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Icon
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none flex items-center justify-between bg-white"
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--theme-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon size={18} className="text-gray-700" />
              <span className="text-gray-700">{value}</span>
            </>
          ) : (
            <span className="text-gray-400">Select an icon</span>
          )}
        </div>
        <ChevronDown size={18} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2 grid grid-cols-4 gap-2">
              {iconNames.map((iconName) => {
                const IconComponent = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                      value === iconName
                        ? "border-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={value === iconName ? {
                      borderColor: "var(--theme-primary)",
                      backgroundColor: "var(--theme-primary-light, rgba(168, 115, 75, 0.1))",
                    } : {}}
                  >
                    <IconComponent size={20} className="text-gray-700" />
                    <span className="text-xs text-gray-600 truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

