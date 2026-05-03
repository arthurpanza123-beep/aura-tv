import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContentCard } from "./ContentCard";
import type { ContentItem } from "@/functions/tmdb.functions";

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
    <section className="relative mb-3 group/row">
      <h2 className="text-base font-bold text-[#e8edf4] mb-2 px-8">{title}</h2>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-2 w-12 z-20 bg-gradient-to-r from-[#0a1628]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8 text-[#e8edf4]" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto px-8 pb-2 scroll-smooth"
        >
          {items.map((item, i) => (
            <ContentCard key={`${item.id}-${i}`} item={item} index={i} showRank={showRank} />
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-2 w-12 z-20 bg-gradient-to-l from-[#0a1628]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-8 h-8 text-[#e8edf4]" />
          </button>
        )}
      </div>
    </section>
  );
}
