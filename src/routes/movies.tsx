import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { Loader2, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Filmes — Central Play Plus" },
      { name: "description", content: "Catálogo de filmes do Central Play Plus" },
    ],
  }),
  component: MoviesPage,
});

const GENRE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "action", label: "Ação" },
  { id: "comedy", label: "Comédia" },
  { id: "drama", label: "Drama" },
  { id: "horror", label: "Terror" },
  { id: "scifi", label: "Ficção Científica" },
  { id: "crime", label: "Crime" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Mais Populares" },
  { id: "rating", label: "Melhor Avaliados" },
  { id: "newest", label: "Mais Recentes" },
];

function MoviesPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeSort, setActiveSort] = useState("popular");

  useEffect(() => {
    fetchHomeData().then((data) => {
      const movieSections = data.sections.filter(s => 
        !s.id.includes("series") && s.id !== "popular_series"
      );
      setSections(movieSections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredSections = activeGenre === "all" 
    ? sections 
    : sections.filter(s => s.id === activeGenre || s.id === "trending");

  const sortItems = (items: ContentItem[]) => {
    if (activeSort === "rating") return [...items].sort((a, b) => b.rating - a.rating);
    if (activeSort === "newest") return [...items].sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="movies" />
      
      <div className="pt-24 lg:pt-28 px-6 lg:px-12">
        <h1 className="text-3xl lg:text-5xl font-black text-foreground mb-8">🍿 Filmes</h1>

        {/* Filters — large for TV */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div className="flex gap-3 tv-scroll overflow-x-auto pb-2">
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

          <div className="flex items-center gap-3 ml-auto">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground cursor-pointer"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        {filteredSections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={sortItems(section.items)} />
        ))}
      </div>
    </div>
  );
}
