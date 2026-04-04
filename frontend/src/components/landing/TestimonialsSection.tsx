import React, { useState, useEffect, useRef } from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { spacing } from "@/utils/spacing";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  avatarSrc?: string;
  name: string;
  location: string;
  text: string;
  rating?: number;
}

export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  className?: string;
}

const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Malik Subhan",
    location: "Product Lead",
    text: "They has a strong grip on system architecture and product execution. The way he structures apps and backend flows is highly scalable and clean. ",
    rating: 4,
    avatarSrc: "/subhan.png",
  },
  {
    name: "Abdur Rahman ",
    location: "Sales & Growth Strategist",
    text: "Team understands business needs beyond just development. He builds products that are actually sellable and user-focused. That’s a rare quality in developers.",
    rating: 4,
    avatarSrc: "/Abdurehman.png",
  },
  {
    name: "Adil",
    location: "Shopify Specialist",
    text: "Good technical skills in web and app development complement e-commerce perfectly. His ability to integrate systems and build scalable solutions is impressive.",
    rating: 4,
    avatarSrc: "/Adil.png",
  },
  {
    name: "Dr. Ali Athar ",
    location: "Surgeon & Consultant",
    text: "Team has the ability to understand domain-specific requirements quickly. His approach to building structured and reliable systems is commendable.",
    rating: 5,
    avatarSrc: "/ali.png",
  },
  {
    name: "Aiman ",
    location: "Creative Design Director",
    text: "He respects design systems and translates UI/UX into development very accurately. That makes collaboration between design and development seamless",
    rating: 4,
    avatarSrc: "/Aiman.png",
  },
];

export default function TestimonialsSection({
  title = "Testimonials",
  subtitle = "Customer Reviews",
  testimonials = defaultTestimonials,
  className,
}: TestimonialsSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const cardsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(testimonials.length / cardsPerPage));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    let timer: number | undefined;

    const isMobile = window.innerWidth < 640;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          timer = window.setTimeout(() => {
            setInView(true);
            if (el) observer.unobserve(el);
          }, 300);
        }
      },
      {
        threshold: isMobile ? 0.35 : 0.6,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    const next = Math.min(Math.max(0, index), totalPages - 1);
    setCurrentSlide(next);
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const scrollLeft = maxScroll > 0 ? (next / (totalPages - 1)) * maxScroll : 0;
      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || totalPages <= 1) return;
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;
      const progress = scrollLeft / maxScroll;
      const index = Math.round(progress * (totalPages - 1));
      setCurrentSlide(Math.min(Math.max(0, index), totalPages - 1));
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  return (
    <section ref={sectionRef} className={cn("py-0 bg-white w-full", className)}>
      <Container12 className={spacing.inner.gap}>
        {/* Section heading – animates from bottom when in view */}
        <div
          className={cn(
            "mb-6 sm:mb-8 md:mb-10 transition-all duration-600 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={true}
            miniInfo={subtitle}
            showDividerLine={true}
            align="left"
          />
        </div>

        {/* Multiple cards visible – horizontal scroll, fade transition between pages */}
        <div
          ref={scrollRef}
          className={cn(
            "overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-2 sm:gap-3 md:gap-4 pb-3 sm:pb-4 pl-3 sm:pl-4 md:pl-6 scrollbar-hide transition-all duration-600 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ scrollSnapType: "x mandatory", transitionDelay: "100ms" }}
        >
          {testimonials.map((item, i) => (
            <div
              key={i}
              className={cn(
                "shrink-0 w-[280px] sm:w-[300px] lg:w-[360px] snap-start transition-all duration-600 ease-out",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={inView ? { transitionDelay: `${180 + i * 60}ms` } : undefined}
            >
              <TestimonialCard
                avatarSrc={item.avatarSrc}
                name={item.name}
                location={item.location}
                text={item.text}
                rating={item.rating}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Indicators (dots) – one per page */}
        <div
          className={cn(
            "flex justify-center gap-1 sm:gap-2 mt-4 sm:mt-6 transition-all duration-600 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={inView ? { transitionDelay: "400ms" } : undefined}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goToSlide(i)}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-300",
                i === currentSlide
                  ? "bg-var(--theme-primary,#8B5E3C)"
                  : "bg-gray-200 border border-gray-300"
              )}
            />
          ))}
        </div>
      </Container12>
    </section>
  );
}
