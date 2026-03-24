import React from "react";
import { Search, Lightbulb, Settings, Rocket } from "lucide-react";

interface ProcessStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface HowWeWorkProps {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
  /** When true, show step numbers (1, 2, 3, 4) above each card. */
  showNumbering?: boolean;
  /** When true, show the connection line and dots above the cards (desktop). */
  showDots?: boolean;
}

const HowWeWork: React.FC<HowWeWorkProps> = ({
  title = "How We Work",
  subtitle = "Our proven process ensures exceptional results for every project",
  steps = [
    {
      icon: Search,
      title: "Research & Planning",
      description: "We start by understanding your needs and conducting thorough research to create a solid foundation for your project.",
    },
    {
      icon: Lightbulb,
      title: "Creative Solutions",
      description: "Our team brainstorms innovative ideas and develops creative solutions tailored to your unique requirements.",
    },
    {
      icon: Settings,
      title: "Development",
      description: "We bring your vision to life with meticulous attention to detail and cutting-edge technology.",
    },
    {
      icon: Rocket,
      title: "Launch & Support",
      description: "We ensure a smooth launch and provide ongoing support to help you achieve long-term success.",
    },
  ],
  showNumbering = true,
  showDots = false,
}) => {
  return (
    <section className={`pt-10 pb-10 md:pt-14 md:pb-14 bg-gray-50 w-full max-w-full overflow-x-hidden overflow-y-visible box-border`}>
      <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header - inner gap before heading */}
        <div className="text-center pt-4 md:pt-6 mb-5 md:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}></div>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Process Steps - inner gap after cards */}
        <div className="relative w-full max-w-full min-w-0 pb-6 md:pb-8">
          {/* Connection Line + Dots - only when showDots is true */}
          {showDots && (
            <>
              <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}></div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 relative w-full max-w-full min-w-0 items-stretch">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative min-w-0 flex flex-col">
                  {/* Step number - above card, only when showNumbering is true */}
                  {showNumbering && (
                    <div className="flex justify-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {index + 1}
                      </div>
                    </div>
                  )}
                  {/* Connection Node (dots) - only when showDots is true */}
                  {showDots && (
                    <div className="hidden lg:block absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}></div>
                  )}

                  <div className="bg-white border-2 border-gray-300 rounded-lg p-3 sm:p-4 h-full min-w-0 flex flex-col flex-1 shadow-sm">
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 shrink-0" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    
                    {/* Title */}
                    <div className="text-center mb-2 shrink-0">
                      <h3 className="text-base sm:text-lg font-semibold px-3 py-1 inline-block rounded" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)", color: "white" }}>
                        {step.title}
                      </h3>
                    </div>
                    
                    {/* Description - flex-1 so card fills remaining height, min-h-0 so text wraps */}
                    <p className="text-xs sm:text-sm text-gray-600 text-center leading-snug flex-1 min-h-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
