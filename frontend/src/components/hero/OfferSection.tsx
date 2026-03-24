import React from "react";

const OfferSection = () => {
  return (
    <section className="bg-white text-black ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Offer Image (3:2 Aspect Ratio) */}
          <div className="w-full overflow-hidden rounded-l-2xl md:rounded-r-none aspect-3/2">
            <img
              src="/offers.png"
              alt="Offer 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right Offer Image (3:2 Aspect Ratio) */}
          <div className="w-full overflow-hidden rounded-r-2xl md:rounded-l-none aspect-3/2">
            <img
              src="/offers.png"
              alt="Offer 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default OfferSection;
