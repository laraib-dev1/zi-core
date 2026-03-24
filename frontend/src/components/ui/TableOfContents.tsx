import React, { useEffect, useState, useRef } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

/**
 * Table of Contents Component
 * 
 * HOW IT WORKS:
 * 1. Parses HTML content to extract headings (H1-H4)
 * 2. Creates a nested tree structure based on heading hierarchy
 * 3. Adds IDs to headings for anchor links
 * 4. Displays clickable TOC with nested indentation
 * 5. Smoothly scrolls to sections when clicked
 */

interface TOCItem {
  id: string;
  text: string;
  level: number; // 1-4 for H1-H4
  children: TOCItem[];
}

interface TableOfContentsProps {
  htmlContent: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  /** "sidebar" = Blog Detail (simple, no fixed). "standalone" = Privacy/Terms (fixed TOC). */
  variant?: "sidebar" | "standalone";
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  htmlContent,
  contentRef,
  variant = "standalone",
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fixedStyle, setFixedStyle] = useState<{ top: number; left: number; width: number }>({
    top: 96,
    left: 24,
    width: 256,
  });
  const [tocVisible, setTocVisible] = useState(true);

  const NAV_TOP = 96; // navbar ke neeche – TOC isse upar nahi jayega

  // Position TOC fixed – hide only when content bottom (Updated date) reaches TOC bottom
  const updatePosition = () => {
    if (!wrapperRef.current || variant !== "standalone") return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spacer = wrapperRef.current.querySelector("[data-toc-fixed-inner]") as HTMLElement;
    const tocHeight = spacer ? spacer.offsetHeight + 24 : 400;

    // Main content column (right side – Updated date etc) ka bottom
    const contentColumn = wrapperRef.current.parentElement?.nextElementSibling as HTMLElement | null;
    const contentBottom = contentColumn
      ? contentColumn.getBoundingClientRect().bottom
      : window.innerHeight;

    let top = Math.max(NAV_TOP, rect.top);
    if (top + tocHeight > contentBottom) {
      top = Math.max(NAV_TOP, contentBottom - tocHeight);
    }

    // Hide only when content bottom (Updated date) reaches TOC bottom, not when it reaches TOC top
    const tocBottomY = NAV_TOP + tocHeight;
    const visible = contentBottom > tocBottomY;

    setTocVisible(visible);
    setFixedStyle({
      top,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (tocItems.length === 0 || variant !== "standalone") return;
    const timer = setTimeout(updatePosition, 200);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    const ro = wrapperRef.current && new ResizeObserver(updatePosition);
    if (ro && wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      ro?.disconnect();
    };
  }, [tocItems.length, variant]);

  // Spacer ki height se sidebar column ka height reserve karo (standalone only)
  useEffect(() => {
    if (!wrapperRef.current || variant !== "standalone") return;
    const spacer = wrapperRef.current.querySelector("[data-toc-fixed-inner]") as HTMLElement;
    if (spacer) wrapperRef.current.style.minHeight = `${spacer.offsetHeight + 24}px`;
  }, [tocItems.length, variant]);

  // Parse HTML and extract headings
  useEffect(() => {
    if (!htmlContent) {
      setTocItems([]);
      return;
    }

    // Wait a bit for the DOM to be ready
    const timer = setTimeout(() => {
      try {
        if (!contentRef?.current) {
          setTocItems([]);
          return;
        }

        // Find all headings in the actual rendered content
        const headings = Array.from(contentRef.current.querySelectorAll("h1, h2, h3, h4"));
        
        if (headings.length === 0) {
          setTocItems([]);
          return;
        }

      // Extract heading data and add IDs
      const headingData: Array<{ text: string; level: number; id: string }> = headings.map((heading, index) => {
        const text = heading.textContent?.trim() || "";
        const tagName = heading.tagName.toLowerCase();
        const level = parseInt(tagName.charAt(1)); // Extract number from h1, h2, etc.
        
        // Generate unique ID if not exists
        let id = heading.id;
        if (!id || id === "") {
          // Create a URL-friendly ID from the heading text
          id = `heading-${index}-${text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "") // Remove special chars
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single
            .replace(/^-|-$/g, "")}`; // Remove leading/trailing hyphens
          
          // Ensure uniqueness
          let uniqueId = id;
          let counter = 1;
          while (contentRef.current?.querySelector(`#${uniqueId}`)) {
            uniqueId = `${id}-${counter}`;
            counter++;
          }
          
          heading.id = uniqueId;
          id = uniqueId;
        }
        
        return { text, level, id };
      });

      // Build nested tree structure
      const buildTree = (items: typeof headingData): TOCItem[] => {
        const result: TOCItem[] = [];
        const stack: TOCItem[] = [];

        items.forEach((item) => {
          const tocItem: TOCItem = {
            id: item.id,
            text: item.text,
            level: item.level,
            children: [],
          };

          // Find the correct parent based on level
          while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
          }

          if (stack.length === 0) {
            // Top-level item
            result.push(tocItem);
          } else {
            // Child of the last item in stack
            stack[stack.length - 1].children.push(tocItem);
          }

          stack.push(tocItem);
        });

        return result;
      };

      const tree = buildTree(headingData);
      setTocItems(tree);

      // Start with all items collapsed by default
      setExpandedItems(new Set());
      } catch (error) {
        console.error("Error generating table of contents:", error);
        setTocItems([]);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [htmlContent, contentRef]);

  // Heading ke sath align: scroll par jo heading view me hai wahi TOC me highlight ho
  useEffect(() => {
    if (!contentRef?.current || tocItems.length === 0) return;

    const NAV_OFFSET = 120; // navbar ke neeche ka zone jahan heading "active" mana jaye

    const updateActiveHeading = () => {
      const headings = contentRef.current!.querySelectorAll("h1, h2, h3, h4");
      if (headings.length === 0) return;

      let active: string | null = null;
      headings.forEach((el) => {
        const id = el.id;
        if (!id) return;
        const top = el.getBoundingClientRect().top;
        // Jo heading NAV_OFFSET ke andar ya thoda neeche hai, usko active maano
        if (top <= NAV_OFFSET + 80) active = id;
      });
      // Agar koi bhi zone me nahi, pehla visible heading active
      if (!active && headings.length > 0) {
        const first = headings[0];
        if (first.getBoundingClientRect().top < window.innerHeight) active = first.id;
      }
      if (active) setActiveId(active);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [tocItems, contentRef]);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Scroll to section with slow, smooth animation
  const scrollToSection = (id: string) => {
    const element = contentRef?.current?.querySelector(`#${id}`);
    if (element) {
      const yOffset = -120; // Offset for fixed header/navbar
      const targetY = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const duration = 2000; // 2 seconds for smooth, slow scroll
      let startTime: number | null = null;

      // Easing function for smooth acceleration/deceleration
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const ease = easeInOutCubic(progress);
        const currentY = startY + distance * ease;
        
        window.scrollTo(0, Math.max(0, currentY));

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Update active ID after scroll completes
          setActiveId(id);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  // Render TOC item recursively
  const renderTOCItem = (item: TOCItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeId === item.id;

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isActive
              ? "font-semibold"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          style={{
            paddingLeft: `${12 + depth * 20}px`,
            ...(isActive ? {
              backgroundColor: "rgba(var(--theme-primary-rgb), 0.1)",
              color: "var(--theme-primary)"
            } : {})
          }}
          onClick={() => {
            scrollToSection(item.id);
            if (hasChildren) {
              toggleExpand(item.id);
            }
          }}
        >
          {hasChildren && (
            <span className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4 h-4" />}
          <span className="text-sm flex-1 truncate">{item.text}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children.map((child) => renderTOCItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tocItems.length === 0) return null;

  const tocContent = (
    <>
      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
        Table of Contents
      </h3>
      <div className="space-y-1">
        {tocItems.map((item) => renderTOCItem(item))}
      </div>
    </>
  );

  if (variant === "sidebar") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {tocContent}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        data-toc-fixed-inner
        className="bg-white border border-gray-200 rounded-lg p-4 opacity-0 pointer-events-none"
        aria-hidden
      >
        {tocContent}
      </div>
      {tocVisible && (
        <div
          data-toc-scroll-with-content
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm z-30"
          style={{
            position: "fixed",
            top: fixedStyle.top,
            left: fixedStyle.left,
            width: fixedStyle.width,
            maxHeight: "calc(100vh - 6rem)",
            overflowY: "auto",
          }}
        >
          {tocContent}
        </div>
      )}
    </div>
  );
};

