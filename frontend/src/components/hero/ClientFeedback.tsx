import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { spacing } from "@/utils/spacing";

/**
 * ClientFeedback.tsx
 *
 * Tailwind + React carousel that visually matches the provided screenshot.
 * - snap scrolling (snap center)
 * - decorative background circles & gradient
 * - card design with quote mark, title, text and bottom author band
 */

const feedbacks = [
  {
    title: "Urna cursus",
    name: "Esther Howard",
    role: "Client",
    text: "Urna cursus eget nunc scelerisque viverra mauris in aliquam. Suspendisse.",
    img: "/client.jpeg",
  },
  {
    title: "Pulvinar etiam",
    name: "Eleanor Pena",
    role: "Client",
    text: "Pulvinar etiam non quam lacus. Pellentesque dignissim enim sit amet.",
    img: "/client.jpeg",
  },
  {
    title: "Feugiat vivamus",
    name: "Annette Black",
    role: "Client",
    text: "Feugiat vivamus at augue eget arcu dictum varius. At in tellus integer.",
    img: "/client.jpeg",
  },
  {
    title: "Lorem ipsum",
    name: "John Doe",
    role: "Client",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    img: "/client.jpeg",
  },
  {
    title: "Phasellus non",
    name: "Jane Smith",
    role: "Client",
    text: "Phasellus non purus eget sapien ullamcorper facilisis.",
    img: "/client.jpeg",
  },
];

const ClientFeedback: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Calculate which card is currently centered/visible
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const updateActiveIndex = () => {
      const cards = carousel.querySelectorAll<HTMLDivElement>("[data-card]");
      if (cards.length === 0) return;

      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - carouselCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    // Initial update
    updateActiveIndex();

    // Update on scroll
    carousel.addEventListener("scroll", updateActiveIndex);
    // Update on resize
    window.addEventListener("resize", updateActiveIndex);

    return () => {
      carousel.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // find first card to calculate width + gap
    const card = carousel.querySelector<HTMLDivElement>("[data-card]");
    if (!card) return;

    const cardWidth = card.clientWidth;
    const gap = 32; // matches gap-8 (8*4=32px)
    const scrollAmount = cardWidth + gap;

    carousel.scrollBy?.({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden py-0 bg-gradient-to-r from-[#f9ede6] to-[#fef9f7]">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute top-8 right-6 w-40 h-40 rounded-full bg-[#f4cdbf] opacity-30 blur-[1px]" />
      <div className="pointer-events-none absolute left-6 bottom-6 w-36 h-36 rounded-full bg-[#f4cdbf] opacity-20 blur-[1px]" />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading – section inner gap before heading */}
        <h2 className={`text-center text-3xl italic text-gray-700 font-serif ${spacing.inner.gapTop} ${spacing.inner.gapBottom}`}>
          Client Feedback
        </h2>

        {/* Dots below heading - Active indicator */}
        <div className={`flex items-center justify-center gap-2 ${spacing.inner.gapBottom}`}>
          {feedbacks.map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8" : ""
              }`}
              style={{
                backgroundColor: "var(--theme-primary, #8B5E3C)",
                opacity: index === activeIndex ? "1" : "0.3"
              }}
            />
          ))}
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 py-4 no-scrollbar"
            // hide native scrollbar visually (add the .no-scrollbar rule to your CSS)
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {feedbacks.map((item, i) => (
              <article
                data-card
                key={i}
                className="bg-white rounded-md shadow-md min-w-[320px] sm:min-w-[360px] md:min-w-[380px] flex-shrink-0 snap-center p-6 flex flex-col"
                role="group"
              >
                {/* quote icon + title */}
                <div className="mb-4">
                  <span 
                    className="text-3xl font-serif mr-2"
                    style={{ color: "var(--theme-primary)" }}
                  >"</span>
                  <h3 className="text-lg font-semibold text-gray-800 inline-block align-middle">
                    {item.title}
                  </h3>
                </div>

                {/* description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{item.text}</p>

                {/* bottom author band */}
                <div className="mt-auto bg-gray-50 border-t border-gray-100 pt-3 -mx-6 px-6 pb-3 flex items-center gap-3">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.name} <span className="font-normal" style={{ color: "var(--theme-primary)" }}>/</span>{" "}
                      <span className="text-xs font-medium" style={{ color: "var(--theme-primary)" }}> {item.role}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClientFeedback;
