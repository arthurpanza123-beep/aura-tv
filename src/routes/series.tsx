import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { ContentGrid } from "@/components/tv/ContentGrid";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { fetchHomeData, type ContentSection } from "@/server/tmdb.functions";

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
  const [showContent, setShowContent] = useState(false);
  const [activeGenre, setActiveGenre] = useState("all");

  useEffect(() => {
    fetchHomeData().then((data) => {
      const seriesSections = data.sections.filter(s =>
        s.id === "popular_series" || s.id === "trending" || s.id === "drama" || s.id === "crime"
      );
      setSections(seriesSections.length > 0 ? seriesSections : data.sections.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  if (loading || !showContent) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 1500 : 600} />;
  }

  const allItems = sections.flatMap(s => s.items);
  const uniqueItems = allItems.filter((item, i, arr) => arr.findIndex(a => a.id === item.id) === i);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}>
      <TVSidebar />

      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
        <div className="sticky top-0 z-30 px-8 pt-6 pb-4" style={{ background: "linear-gradient(180deg, #0a1628 70%, transparent)" }}>
          <h1 className="text-2xl font-bold text-[#e8edf4] mb-4">Séries</h1>
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

        <div className="px-4 pb-8">
          <ContentGrid items={uniqueItems} />
        </div>
      </main>
    </div>
  );
}
