import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { HeroBanner } from "@/components/tv/HeroBanner";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Central Play Plus — Início" },
      { name: "description", content: "Assista canais ao vivo, filmes e séries no Central Play Plus." },
    ],
  }),
  component: HomePage,
});

// Static channels data
const CHANNELS: ContentItem[] = [
  { id: 90001, title: "Globo", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Rede_Globo_logo.svg/200px-Rede_Globo_logo.svg.png", backdrop: "", overview: "Rede Globo", rating: 0, year: "", mediaType: "tv" },
  { id: 90002, title: "SBT", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/SBT_logo.svg/200px-SBT_logo.svg.png", backdrop: "", overview: "SBT", rating: 0, year: "", mediaType: "tv" },
  { id: 90003, title: "Record TV", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/RecordTV_logo.svg/200px-RecordTV_logo.svg.png", backdrop: "", overview: "Record TV", rating: 0, year: "", mediaType: "tv" },
  { id: 90004, title: "Band", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rede_Bandeirantes_logo_2019.svg/200px-Rede_Bandeirantes_logo_2019.svg.png", backdrop: "", overview: "Band", rating: 0, year: "", mediaType: "tv" },
  { id: 90005, title: "ESPN", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ESPN_logo.svg/200px-ESPN_logo.svg.png", backdrop: "", overview: "ESPN Brasil", rating: 0, year: "", mediaType: "tv" },
  { id: 90006, title: "SporTV", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/SporTV_2021.svg/200px-SporTV_2021.svg.png", backdrop: "", overview: "SporTV", rating: 0, year: "", mediaType: "tv" },
  { id: 90007, title: "Multishow", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Multishow_2020.svg/200px-Multishow_2020.svg.png", backdrop: "", overview: "Multishow", rating: 0, year: "", mediaType: "tv" },
  { id: 90008, title: "GloboNews", poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/GloboNews_2020.svg/200px-GloboNews_2020.svg.png", backdrop: "", overview: "GloboNews", rating: 0, year: "", mediaType: "tv" },
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
      <Navbar />

      {/* Hero */}
      <HeroBanner item={hero} />

      {/* Content Sections */}
      <div className="-mt-16 relative z-10">
        {/* Channels */}
        <ContentRow title="📡 Canais ao Vivo" items={CHANNELS} />

        {/* TMDB Sections */}
        {sections.map((section, i) => (
          <ContentRow
            key={section.id}
            title={section.title}
            items={section.items}
            showRank={section.id === "trending" && i === 0}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 text-center border-t border-border/20">
        <p className="text-xs text-muted-foreground">
          © 2026 Central Play Plus — Todos os direitos reservados
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          Dados fornecidos por TMDB. Este produto usa a API do TMDB mas não é endossado ou certificado pelo TMDB.
        </p>
      </footer>
    </div>
  );
}
