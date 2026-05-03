import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { ContentGrid } from "@/components/tv/ContentGrid";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { fetchHomeData, type ContentItem, type ContentSection } from "@/server/tmdb.functions";
import { SlidersHorizontal } from "lucide-react";

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
  { id: "popular", label: "Populares" },
  { id: "rating", label: "Avaliação" },
  { id: "newest", label: "Recentes" },
];

function MoviesPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeSort, setActiveSort] = useState("popular");

  useEffect(() => {
    fetchHomeData().then((data) => {
      const movieSections = data.sections.filter(s => !s.id.includes("series") && s.id !== "popular_series");
      setSections(movieSections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  if (loading || !showContent) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 1500 : 600} />;
  }

  const allItems = sections.flatMap(s => s.items);
  const uniqueItems = allItems.filter((item, i, arr) => arr.findIndex(a => a.id === item.id) === i);

  const sortedItems = [...uniqueItems].sort((a, b) => {
    if (activeSort === "rating") return b.rating - a.rating;
    if (activeSort === "newest") return (b.year || "").localeCompare(a.year || "");
    return 0;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}>
      <TVSidebar />

      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 px-8 pt-6 pb-4" style={{ background: "linear-gradient(180deg, #0a1628 70%, transparent)" }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#e8edf4]">Filmes</h1>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#6b7f99]" />
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-[#0f1e35] border border-[#1a2e48] rounded-lg px-3 py-1.5 text-sm text-[#c8d4e0] cursor-pointer"
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {GENRE_FILTERS.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  activeGenre === g.id
                    ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                    : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
                }`}
                tabIndex={0}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="px-4 pb-8">
          <ContentGrid items={sortedItems} />
        </div>
      </main>
    </div>
  );
}
