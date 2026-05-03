import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContentCard } from "./ContentCard";
import type { ContentItem } from "@/server/tmdb.functions";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  showRank?: boolean;
}

export function ContentRow({ title, items, showRank }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  if (!items.length) return null;

  return (
    <section className="relative mb-8 lg:mb-12 group/row">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-4 px-6 lg:px-12">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-4 w-14 z-20 bg-gradient-to-r from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-10 h-10 text-foreground" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="tv-scroll flex gap-3 lg:gap-4 overflow-x-auto px-6 lg:px-12 pb-4 scroll-smooth"
        >
          {items.map((item, i) => (
            <ContentCard
              key={`${item.id}-${i}`}
              item={item}
              index={i}
              showRank={showRank}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-4 w-14 z-20 bg-gradient-to-l from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-10 h-10 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
