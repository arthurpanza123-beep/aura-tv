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
      const movieSections = data.sections.filter(s => !s.id.includes("series") && s.id !== "popular_series");
      setSections(movieSections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredSections = activeGenre === "all" ? sections : sections.filter(s => s.id === activeGenre || s.id === "trending");

  const sortItems = (items: ContentItem[]) => {
    if (activeSort === "rating") return [...items].sort((a, b) => b.rating - a.rating);
    if (activeSort === "newest") return [...items].sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    return items;
  };

  if (loading) {
    return (
      <div className="tv-shell items-center justify-center" style={{ background: "linear-gradient(160deg, #0a1628, #0d1f3c, #0c1a2e)" }}>
        <Loader2 className="w-10 h-10 text-[#2a7ab0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)" }}>
      <Navbar activeTab="movies" />

      <div className="pt-16 px-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#e8edf4]">Filmes</h1>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#6b7f99]" />
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="bg-[#0f1e35] border border-[#1a2e48] rounded-lg px-3 py-2 text-sm text-[#c8d4e0] cursor-pointer"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-10 py-3 flex gap-2">
        {GENRE_FILTERS.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGenre(g.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              activeGenre === g.id
                ? "bg-[#1a5276] text-white border-[#2a7ab0]/50"
                : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
            }`}
            tabIndex={0}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-start">
        {filteredSections.slice(0, 3).map((section) => (
          <ContentRow key={section.id} title={section.title} items={sortItems(section.items)} />
        ))}
      </div>
    </div>
  );
}
