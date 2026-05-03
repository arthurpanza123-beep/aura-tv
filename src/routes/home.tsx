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
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-base">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="home" />

      {/* Hero Banner — large, TV-optimized */}
      {hero && (
        <div className="relative w-full h-[55vh] min-h-[350px] lg:h-[65vh] lg:max-h-[700px] overflow-hidden">
          {hero.backdrop && (
            <img src={hero.backdrop} alt={hero.title} className="absolute inset-0 w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

          <div className="relative z-10 flex flex-col justify-end h-full px-6 lg:px-12 pb-12 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-md bg-primary/20 text-primary text-sm font-bold tracking-wider uppercase border border-primary/30">
                Em Destaque
              </span>
              {hero.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-base font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400" /> {hero.rating}
                </span>
              )}
              {hero.year && <span className="text-muted-foreground text-sm">{hero.year}</span>}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-4 leading-none tracking-tight drop-shadow-lg">
              {hero.title}
            </h1>
            <p className="text-base lg:text-lg text-foreground/70 mb-6 line-clamp-2 max-w-xl">{hero.overview}</p>
            <div className="flex items-center gap-3">
              <a
                href={`/player/${hero.id}`}
                className="tv-btn flex items-center gap-3 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-lg cursor-pointer hover:bg-primary/90 no-underline transition-all"
                tabIndex={0}
              >
                <Play className="w-5 h-5 fill-current" /> Assistir
              </a>
              <a
                href={`/details/${hero.id}`}
                className="tv-btn flex items-center gap-2 h-14 px-6 rounded-xl bg-secondary/80 text-secondary-foreground font-semibold text-base cursor-pointer hover:bg-secondary backdrop-blur-sm no-underline transition-all"
                tabIndex={0}
              >
                <Info className="w-5 h-5" /> Mais Info
              </a>
              <button className="tv-btn h-14 w-14 rounded-full border-2 border-muted-foreground/30 text-muted-foreground flex items-center justify-center cursor-pointer hover:border-foreground hover:text-foreground transition-all" tabIndex={0}>
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="relative z-10 -mt-8">
        <ContinueWatchingRow items={CONTINUE_WATCHING} />
        {sections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>

      <footer className="px-6 lg:px-12 py-8 text-center border-t border-border/20">
        <p className="text-xs text-muted-foreground">© 2026 Central Play Plus — Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

function ContinueWatchingRow({ items }: { items: (ContentItem & { progress: number })[] }) {
  return (
    <section className="mb-8 lg:mb-12">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-4 px-6 lg:px-12 flex items-center gap-3">
        <Clock className="w-6 h-6 text-primary" /> Continue Assistindo
      </h2>
      <div className="tv-scroll flex gap-4 overflow-x-auto px-6 lg:px-12 pb-4">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/player/${item.id}`}
            className="tv-card group relative flex-shrink-0 overflow-hidden bg-card cursor-pointer w-[300px] lg:w-[380px] rounded-xl no-underline block"
            style={{ aspectRatio: "16/9" }}
            tabIndex={0}
          >
            {item.backdrop ? (
              <img src={item.backdrop} alt={item.title} className="w-full h-full object-cover" />
            ) : item.poster ? (
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-base font-bold text-foreground truncate">{item.title}</h3>
              {item.overview && <p className="text-sm text-muted-foreground">{item.overview}</p>}
              <div className="w-full h-1.5 rounded-full bg-foreground/20 mt-3">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
                <Play className="w-7 h-7 text-primary-foreground fill-current" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
