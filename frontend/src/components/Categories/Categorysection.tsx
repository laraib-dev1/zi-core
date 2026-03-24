import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { spacing } from "@/utils/spacing";

interface Category {
  title: string;
  image?: string;
}

interface CategorySectionProps {
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={`bg-white text-black ${spacing.section.gap}`}>
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Heading and Handlers in one row */}
        <div className="flex justify-between items-center px-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
            ALL GIFT IDEAS
          </h2>

          {/* Handlers on the right */}
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="bg-white rounded-full p-1 sm:p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
              style={{ cursor: "pointer" }}
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <button
              onClick={scrollRight}
              className="bg-white rounded-full p-1 sm:p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
              style={{ cursor: "pointer" }}
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Categories Container - Centered and contained within margins */}
        <div className={`w-full overflow-hidden px-2 justify-center ${spacing.inner.gapTop}`}>
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-2 sm:pb-3 md:pb-4 scrollbar-hide justify-start"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none"
            }}
          >
          {categories.map((cat, index) => (
            <div
              key={index}
              className="shrink-0 w-24 md:w-48 text-center group"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const categoryName = cat.title;
                window.location.href = `/shop?category=${encodeURIComponent(categoryName)}`;
              }}
            >
              <div className="overflow-hidden rounded-2xl shadow-md bg-gray-200 aspect-square">
                <img
                  src={(cat.image && cat.image.trim() !== "") ? cat.image : "/category.png"}
                  alt={cat.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + "/category.png") {
                      target.src = "/category.png";
                    }
                  }}
                />
              </div>
              <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-lg text-gray-800 font-medium italic">
                {cat.title}
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
