import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { Loader2, Play, Info, Plus, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Central Play Plus — Início" },
      { name: "description", content: "Assista canais ao vivo, filmes e séries no Central Play Plus." },
    ],
  }),
  component: HomePage,
});

const CONTINUE_WATCHING: (ContentItem & { progress: number })[] = [
  { id: 550, title: "Clube da Luta", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "https://image.tmdb.org/t/p/w780/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg", overview: "", rating: 8.4, year: "1999", mediaType: "movie", progress: 65 },
  { id: 1396, title: "Breaking Bad", poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop: "https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", overview: "S3 E5", rating: 8.9, year: "2008", mediaType: "tv", progress: 42 },
  { id: 100088, title: "The Last of Us", poster: "https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", backdrop: "https://image.tmdb.org/t/p/w780/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg", overview: "S1 E7", rating: 8.8, year: "2023", mediaType: "tv", progress: 80 },
];

function HomePage() {
  const [hero, setHero] = useState<ContentItem | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRow, setActiveRow] = useState(0);

  useEffect(() => {
    fetchHomeData().then((data) => {
      setHero(data.hero);
      setSections(data.sections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tv-shell items-center justify-center" style={{ background: "linear-gradient(160deg, #0a1628, #0d1f3c, #0c1a2e)" }}>
        <Loader2 className="w-10 h-10 text-[#2a7ab0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)" }}>
      <Navbar activeTab="home" />

      {/* Hero - compact for 16:9 fit */}
      {hero && (
        <div className="relative w-full flex-shrink-0" style={{ height: "52vh" }}>
          {hero.backdrop && (
            <img src={hero.backdrop} alt={hero.title} className="absolute inset-0 w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-[#0a1628]/40" />

          <div className="relative z-10 flex flex-col justify-end h-full px-10 pb-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-[#2a7ab0] bg-[#2a7ab0]/10 border border-[#2a7ab0]/20">
                Em Destaque
              </span>
              {hero.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-yellow-400" /> {hero.rating}
                </span>
              )}
              {hero.year && <span className="text-[#6b7f99] text-xs">{hero.year}</span>}
            </div>
            <h1 className="text-3xl font-bold text-[#e8edf4] mb-2 leading-tight">{hero.title}</h1>
            <p className="text-sm text-[#8a9bb5] mb-4 line-clamp-2 max-w-lg">{hero.overview}</p>
            <div className="flex items-center gap-3">
              <a href={`/player/${hero.id}`} className="tv-btn flex items-center gap-2 h-11 px-7 rounded-lg bg-[#1a5a8a] hover:bg-[#1e6a9e] text-white font-bold text-sm cursor-pointer no-underline transition-all" tabIndex={0}>
                <Play className="w-4 h-4 fill-current" /> Assistir
              </a>
              <a href={`/details/${hero.id}`} className="tv-btn flex items-center gap-2 h-11 px-5 rounded-lg bg-[#162a42] hover:bg-[#1a3050] text-[#c8d4e0] font-semibold text-sm cursor-pointer no-underline transition-all" tabIndex={0}>
                <Info className="w-4 h-4" /> Mais Info
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Content rows - fill remaining space */}
      <div className="flex-1 min-h-0 flex flex-col justify-start pt-2">
        <ContinueWatchingRow items={CONTINUE_WATCHING} />
        {sections.slice(0, 1).map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}

function ContinueWatchingRow({ items }: { items: (ContentItem & { progress: number })[] }) {
  return (
    <section className="mb-3">
      <h2 className="text-base font-bold text-[#e8edf4] mb-2 px-10 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#2a7ab0]" /> Continue Assistindo
      </h2>
      <div className="flex gap-3 overflow-x-auto px-10 pb-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/player/${item.id}`}
            className="tv-card group relative flex-shrink-0 overflow-hidden bg-[#0f1e35] cursor-pointer w-[260px] rounded-xl no-underline block"
            style={{ aspectRatio: "16/9" }}
            tabIndex={0}
          >
            {item.backdrop ? (
              <img src={item.backdrop} alt={item.title} className="w-full h-full object-cover" />
            ) : item.poster ? (
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-3">
              <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
              <div className="w-full h-1 rounded-full bg-white/20 mt-2">
                <div className="h-full rounded-full bg-[#2a7ab0]" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-[#1a5a8a]/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
