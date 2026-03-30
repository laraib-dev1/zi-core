import React from "react";
import { Flag, Box, Headphones, Truck } from "lucide-react";

const features = [
  {
    icon: Flag,
    title: "Well Arranged",
    description: "Have Arrange team with UX.",
  },
  {
    icon: Box,
    title: "Serve Best",
    description: "Serve with own applications.",
  },
  {
    icon: Headphones,
    title: "Online Support",
    description: "Give support on your availability",
  },
  {
    icon: Truck,
    title: "System Driven",
    description: "Follow system driven approach",
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
            className="bg-[#f5f6f8] p-4 md:p-5 rounded-md border border-gray-200 text-center hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-center mb-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-md bg-white border border-gray-300 flex items-center justify-center">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-1">
              {feature.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCards;
