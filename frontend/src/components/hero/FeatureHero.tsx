import React from "react";
import { spacing } from "@/utils/spacing";

interface FeatureHeroProps {
  image?: string;
}

const FeatureHero: React.FC<FeatureHeroProps> = ({ image }) => {
  const bannerImage = image || "/hero.png";
  
  return (
    <section className={`bg-white text-black ${spacing.section.gap}`}>
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
        {/* Text content */}
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900 ${spacing.inner.gapBottom}`}>
            An alchemy of gold and perfume
          </h2>
          <p className={`text-xs sm:text-sm md:text-base text-gray-600 ${spacing.inner.gapBottom}`}>
            The Maison's iconic fragrance, adorned in gold to celebrate the
            brilliance of the holidays.
          </p>
        </div>

        {/* Image */}
        <div className="w-full">
          <img
            src={bannerImage}
            alt="Perfume collection"
            className="w-full max-w-full h-[120px] sm:h-[160px] md:h-[250px] lg:h-[350px] xl:h-[450px] object-cover rounded-lg sm:rounded-xl md:rounded-2xl mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureHero;
