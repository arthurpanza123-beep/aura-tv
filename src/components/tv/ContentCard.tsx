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
    <button
      className="tv-card group relative flex-shrink-0 overflow-hidden bg-card cursor-pointer w-[160px] lg:w-[185px]"
      style={{ aspectRatio: "2/3" }}
      tabIndex={0}
    >
      {/* Rank number for Top 10 */}
      {showRank && index !== undefined && (
        <div className="absolute -left-1 bottom-0 z-20 text-[80px] lg:text-[100px] font-black leading-none text-foreground/10 select-none" style={{ textShadow: "2px 2px 0 oklch(0.55 0.2 260 / 30%)" }}>
          {index + 1}
        </div>
      )}

      {/* Skeleton */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-card animate-pulse" />
      )}

      {/* Poster */}
      {item.poster && !imgError ? (
        <img
          src={item.poster}
          alt={item.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-card p-3">
          <span className="text-xs text-muted-foreground text-center">{item.title}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-sm font-bold text-foreground truncate mb-1">{item.title}</h3>
        <div className="flex items-center gap-2 text-xs">
          {item.rating > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-400 font-semibold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {item.rating}
            </span>
          )}
          {item.year && <span className="text-muted-foreground">{item.year}</span>}
          <span className="text-primary text-[10px] uppercase font-semibold tracking-wider">
            {item.mediaType === "tv" ? "Série" : "Filme"}
          </span>
        </div>
      </div>
    </button>
  );
}
