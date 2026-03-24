import React from "react";
import { Flag, RotateCcw, Headphones, Truck } from "lucide-react";

const features = [
  {
    icon: Flag,
    title: "Locally Owned",
    description: "Local business, best quality clothes",
  },
  {
    icon: RotateCcw,
    title: "Easy Return",
    description: "Easy return policy",
  },
  {
    icon: Headphones,
    title: "Online Support",
    description: "24/7 online support",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Fast delivery for customers",
  },
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow"
          >
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-white border-2 flex items-center justify-center theme-heading" style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}>
                <Icon className="w-6 h-6 md:w-7 md:h-7 theme-heading" style={{ color: "var(--theme-primary, #8B5E3C)" }} />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">
              {feature.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCards;
