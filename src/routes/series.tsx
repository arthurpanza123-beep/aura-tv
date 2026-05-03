import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentSection } from "@/server/tmdb.functions";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const filteredSections = activeGenre === "all"
    ? sections
    : sections.filter(s => s.id === activeGenre || s.id === "popular_series");

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="series" />
      
      <div className="pt-24 lg:pt-28 px-6 lg:px-12">
        <h1 className="text-3xl lg:text-5xl font-black text-foreground mb-8">📺 Séries</h1>

        <div className="flex gap-3 tv-scroll overflow-x-auto pb-2 mb-10">
          {GENRE_FILTERS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g.id)}
              className={`px-5 py-3 rounded-full text-base font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeGenre === g.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
              tabIndex={0}
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
