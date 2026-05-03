import { Star } from "lucide-react";
import type { ContentItem } from "@/server/tmdb.functions";
import { useState } from "react";

interface ContentCardProps {
  item: ContentItem;
  index?: number;
  showRank?: boolean;
}

export function ContentCard({ item, index, showRank }: ContentCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={`/details/${item.id}`}
      className="tv-card group relative flex-shrink-0 overflow-hidden bg-[#0f1e35] cursor-pointer w-full min-w-[120px] max-w-[180px] no-underline block"
      style={{ aspectRatio: "2/3" }}
      tabIndex={0}
    >
      {showRank && index !== undefined && (
        <div className="absolute -left-1 bottom-0 z-20 text-[60px] font-black leading-none text-white/8 select-none">
          {index + 1}
        </div>
      )}

      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-[#0f1e35] animate-pulse" />
      )}

      {item.poster && !imgError ? (
        <img
          src={item.poster}
          alt={item.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#0f1e35] p-2">
          <span className="text-xs text-[#6b7f99] text-center">{item.title}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-xs font-bold text-white truncate mb-0.5">{item.title}</h3>
        <div className="flex items-center gap-1.5 text-[10px]">
          {item.rating > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-400 font-semibold">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {item.rating}
            </span>
          )}
          {item.year && <span className="text-[#8a9bb5]">{item.year}</span>}
        </div>
      </div>
    </a>
  );
}
