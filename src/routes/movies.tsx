import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { ContentCard } from "@/components/tv/ContentCard";
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
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="movies" />
      
      <div className="pt-24 px-6 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl lg:text-4xl font-black text-foreground">🍿 Filmes</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Genre pills */}
          <div className="flex gap-2 tv-scroll overflow-x-auto pb-2">
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

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div>
        {filteredSections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={sortItems(section.items)} />
        ))}
      </div>
    </div>
  );
}
