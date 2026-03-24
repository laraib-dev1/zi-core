import React from "react";
import { spacing } from "@/utils/spacing";

interface AboutHeroProps {
  title?: string;
  description?: string;
  stats?: Array<{ value: string; label: string }>;
  image?: string;
}

const AboutHero: React.FC<AboutHeroProps> = ({
  title = "Building Excellence Through Innovation and Integrity",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  stats = [
    { value: "15+", label: "YEARS OF EXCELLENCE" },
    { value: "500+", label: "SATISFIED CLIENTS" },
    { value: "1200+", label: "PROJECTS COMPLETED" },
  ],
  image = "/about-hero.jpg",
}) => {
  return (
    <section className={spacing.section.gap}>
      <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            
            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              <p>{description}</p>
              <p>{description}</p>
              <p>{description}</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--theme-primary, #8B5E3C)" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={image}
                alt="About Us"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero.png";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
