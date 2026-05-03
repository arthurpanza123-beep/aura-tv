import type { ContentItem } from "@/functions/tmdb.functions";
import { Play, Plus, Star, Info } from "lucide-react";

interface HeroBannerProps {
  item: ContentItem | null;
}

export function HeroBanner({ item }: HeroBannerProps) {
  if (!item) return null;

  return (
    <div className="relative w-full h-[65vh] min-h-[450px] max-h-[750px] overflow-hidden">
      {/* Backdrop Image */}
      {item.backdrop && (
        <img
          src={item.backdrop}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 lg:px-12 pb-16 max-w-3xl">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold tracking-wider uppercase border border-primary/30">
            Em Destaque
          </span>
          {item.rating > 0 && (
            <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
              <Star className="w-4 h-4 fill-yellow-400" />
              {item.rating}
            </span>
          )}
          {item.year && <span className="text-muted-foreground text-sm">{item.year}</span>}
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            {item.mediaType === "tv" ? "Série" : "Filme"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-4 leading-none tracking-tight drop-shadow-lg">
          {item.title}
        </h1>

        {/* Overview */}
        <p className="text-sm lg:text-base text-foreground/80 mb-6 line-clamp-3 leading-relaxed max-w-xl">
          {item.overview}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            tabIndex={0}
            className="tv-btn flex items-center gap-2 h-12 lg:h-14 px-8 rounded-lg bg-foreground text-background font-bold text-base cursor-pointer hover:bg-foreground/90 transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
            Assistir
          </button>
          <button
            tabIndex={0}
            className="tv-btn flex items-center gap-2 h-12 lg:h-14 px-6 rounded-lg bg-secondary/80 text-secondary-foreground font-semibold text-base cursor-pointer hover:bg-secondary transition-colors backdrop-blur-sm"
          >
            <Info className="w-5 h-5" />
            Mais Info
          </button>
          <button
            tabIndex={0}
            className="tv-btn flex items-center justify-center h-12 lg:h-14 w-12 lg:w-14 rounded-full border-2 border-muted-foreground/40 text-muted-foreground cursor-pointer hover:border-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
