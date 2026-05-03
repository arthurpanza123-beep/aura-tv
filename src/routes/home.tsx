import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { ContentRow } from "@/components/tv/ContentRow";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { Play, Info, Star, Clock } from "lucide-react";

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
  { id: 299534, title: "Vingadores: Ultimato", poster: "https://image.tmdb.org/t/p/w342/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop: "https://image.tmdb.org/t/p/w780/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", overview: "", rating: 8.3, year: "2019", mediaType: "movie", progress: 30 },
];

function HomePage() {
  const [hero, setHero] = useState<ContentItem | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchHomeData().then((data) => {
      setHero(data.hero);
      setSections(data.sections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  if (loading) {
    return <LoadingScreen onFinished={handleLoadingFinished} />;
  }

  if (!showContent && loading === false) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={800} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}>
      <TVSidebar />

      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
        {/* Hero Banner */}
        {hero && (
          <div className="relative w-full" style={{ height: "60vh", minHeight: 400 }}>
            {hero.backdrop && (
              <img src={hero.backdrop} alt={hero.title} className="absolute inset-0 w-full h-full object-cover object-top" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-[#0a1628]/30" />

            <div className="relative z-10 flex flex-col justify-end h-full px-12 pb-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase text-[#2a9af0] bg-[#2a9af0]/10 border border-[#2a9af0]/20">
                  Em Destaque
                </span>
                {hero.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {hero.rating}
                  </span>
                )}
                {hero.year && <span className="text-[#6b7f99] text-sm">{hero.year}</span>}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-[#e8edf4] mb-3 leading-tight">{hero.title}</h1>
              <p className="text-sm text-[#8a9bb5] mb-5 line-clamp-2 max-w-lg leading-relaxed">{hero.overview}</p>
              <div className="flex items-center gap-3">
                <a href={`/player/${hero.id}`} className="tv-btn flex items-center gap-2 h-12 px-8 rounded-lg bg-[#2a9af0] hover:bg-[#3aabff] text-white font-bold text-sm cursor-pointer no-underline transition-all shadow-lg shadow-[#2a9af0]/30" tabIndex={0}>
                  <Play className="w-5 h-5 fill-current" /> Assistir
                </a>
                <a href={`/details/${hero.id}`} className="tv-btn flex items-center gap-2 h-12 px-6 rounded-lg bg-[#e8edf4]/10 hover:bg-[#e8edf4]/15 text-[#e8edf4] font-semibold text-sm cursor-pointer no-underline transition-all backdrop-blur-sm" tabIndex={0}>
                  <Info className="w-5 h-5" /> Mais Info
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="py-4 space-y-2">
          {/* Continue Watching */}
          <section className="mb-2">
            <h2 className="text-base font-bold text-[#e8edf4] mb-3 px-12 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2a9af0]" /> Continue Assistindo
            </h2>
            <div className="flex gap-3 overflow-x-auto px-12 pb-2">
              {CONTINUE_WATCHING.map((item) => (
                <a
                  key={item.id}
                  href={`/player/${item.id}`}
                  className="tv-card group relative flex-shrink-0 overflow-hidden bg-[#0f1e35] cursor-pointer w-[280px] rounded-xl no-underline block"
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
                      <div className="h-full rounded-full bg-[#2a9af0]" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#2a9af0]/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* TMDB sections */}
          {sections.map((section) => (
            <ContentRow key={section.id} title={section.title} items={section.items} />
          ))}
        </div>
      </main>
    </div>
  );
}
