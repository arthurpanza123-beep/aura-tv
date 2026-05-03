import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { Loader2, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Séries — Central Play Plus" },
      { name: "description", content: "Catálogo de séries do Central Play Plus" },
    ],
  }),
  component: SeriesPage,
});

const GENRE_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "action", label: "Ação" },
  { id: "comedy", label: "Comédia" },
  { id: "drama", label: "Drama" },
  { id: "scifi", label: "Ficção Científica" },
  { id: "crime", label: "Crime" },
];

function SeriesPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("all");

  useEffect(() => {
    fetchHomeData().then((data) => {
      const seriesSections = data.sections.filter(s => 
        s.id === "popular_series" || s.id === "trending" || s.id === "scifi" || s.id === "crime" || s.id === "drama"
      );
      setSections(seriesSections.length > 0 ? seriesSections : data.sections.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const filteredSections = activeGenre === "all"
    ? sections
    : sections.filter(s => s.id === activeGenre || s.id === "popular_series");

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="series" />
      
      <div className="pt-24 px-6 lg:px-12">
        <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-6">📺 Séries</h1>

        {/* Genre pills */}
        <div className="flex gap-2 tv-scroll overflow-x-auto pb-2 mb-8">
          {GENRE_FILTERS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeGenre === g.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filteredSections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}
