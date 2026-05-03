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
      <div className="tv-shell items-center justify-center" style={{ background: "linear-gradient(160deg, #0a1628, #0d1f3c, #0c1a2e)" }}>
        <Loader2 className="w-10 h-10 text-[#2a7ab0] animate-spin" />
      </div>
    );
  }

  const filteredSections = activeGenre === "all" ? sections : sections.filter(s => s.id === activeGenre || s.id === "popular_series");

  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)" }}>
      <Navbar activeTab="series" />

      <div className="pt-16 px-10">
        <h1 className="text-2xl font-bold text-[#e8edf4]">Séries</h1>
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
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}
