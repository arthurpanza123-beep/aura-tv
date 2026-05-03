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

// "Continue Assistindo" demo data
const CONTINUE_WATCHING: (ContentItem & { progress: number })[] = [
  { id: 550, title: "Clube da Luta", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "https://image.tmdb.org/t/p/w780/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg", overview: "", rating: 8.4, year: "1999", mediaType: "movie", progress: 65 },
  { id: 1396, title: "Breaking Bad", poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop: "https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", overview: "S3 E5", rating: 8.9, year: "2008", mediaType: "tv", progress: 42 },
  { id: 100088, title: "The Last of Us", poster: "https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", backdrop: "https://image.tmdb.org/t/p/w780/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg", overview: "S1 E7", rating: 8.8, year: "2023", mediaType: "tv", progress: 80 },
];

function HomePage() {
  const [hero, setHero] = useState<ContentItem | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData().then((data) => {
      setHero(data.hero);
      setSections(data.sections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="home" />

      {/* Compact Hero Banner */}
      {hero && (
        <div className="relative w-full h-[45vh] min-h-[300px] max-h-[500px] overflow-hidden mt-14 lg:mt-16">
          {hero.backdrop && (
            <img src={hero.backdrop} alt={hero.title} className="absolute inset-0 w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

          <div className="relative z-10 flex flex-col justify-end h-full px-6 lg:px-12 pb-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-bold tracking-wider uppercase border border-primary/30">
                Em Destaque
              </span>
              {hero.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" /> {hero.rating}
                </span>
              )}
              {hero.year && <span className="text-muted-foreground text-xs">{hero.year}</span>}
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-foreground mb-3 leading-none tracking-tight drop-shadow-lg">
              {hero.title}
            </h1>
            <p className="text-sm text-foreground/70 mb-5 line-clamp-2 max-w-lg">{hero.overview}</p>
            <div className="flex items-center gap-2">
              <button className="tv-btn flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm cursor-pointer hover:bg-primary/90">
                <Play className="w-4 h-4 fill-current" /> Assistir
              </button>
              <button className="tv-btn flex items-center gap-2 h-11 px-5 rounded-lg bg-secondary/80 text-secondary-foreground font-medium text-sm cursor-pointer hover:bg-secondary backdrop-blur-sm">
                <Info className="w-4 h-4" /> Mais Info
              </button>
              <button className="tv-btn h-11 w-11 rounded-full border-2 border-muted-foreground/30 text-muted-foreground flex items-center justify-center cursor-pointer hover:border-foreground hover:text-foreground">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="relative z-10 -mt-8">
        {/* Continue Watching */}
        <ContinueWatchingRow items={CONTINUE_WATCHING} />

        {/* TMDB Sections */}
        {sections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 text-center border-t border-border/20">
        <p className="text-xs text-muted-foreground">© 2026 Central Play Plus — Todos os direitos reservados</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          Dados fornecidos por TMDB. Este produto usa a API do TMDB mas não é endossado ou certificado pelo TMDB.
        </p>
      </footer>
    </div>
  );
}

/* ── Continue Watching Row ── */
function ContinueWatchingRow({ items }: { items: (ContentItem & { progress: number })[] }) {
  return (
    <section className="mb-6 lg:mb-10">
      <h2 className="text-lg lg:text-xl font-bold text-foreground mb-3 px-6 lg:px-12 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" /> Continue Assistindo
      </h2>
      <div className="tv-scroll flex gap-3 overflow-x-auto px-6 lg:px-12 pb-4">
        {items.map((item) => (
          <button
            key={item.id}
            className="tv-card group relative flex-shrink-0 overflow-hidden bg-card cursor-pointer w-[280px] lg:w-[340px] rounded-xl"
            style={{ aspectRatio: "16/9" }}
            tabIndex={0}
          >
            {item.backdrop ? (
              <img src={item.backdrop} alt={item.title} className="w-full h-full object-cover" />
            ) : item.poster ? (
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
            ) : null}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
              <h3 className="text-sm font-bold text-foreground truncate">{item.title}</h3>
              {item.overview && <p className="text-xs text-muted-foreground">{item.overview}</p>}

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-foreground/20 mt-2">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </div>

            {/* Play icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
