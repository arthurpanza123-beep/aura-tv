import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentSection } from "@/server/tmdb.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Kids — Central Play Plus" },
      { name: "description", content: "Conteúdo infantil no Central Play Plus" },
    ],
  }),
  component: KidsPage,
});

function KidsPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData().then((data) => {
      const kidsSections = data.sections.filter(s => s.id === "animation" || s.id === "family");
      if (kidsSections.length === 0 && data.sections.length > 0) {
        const allItems = data.sections.flatMap(s => s.items);
        kidsSections.push({ id: "kids_all", title: "Para as Crianças", items: allItems.slice(0, 20) });
      }
      setSections(kidsSections.length > 0 ? kidsSections : data.sections.slice(0, 4));
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

  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0f1530 0%, #151a3a 30%, #12182e 60%, #0c1a2e 100%)" }}>
      <Navbar activeTab="kids" />

      <div className="pt-16 px-10">
        <h1 className="text-2xl font-bold text-[#e8edf4]">
          🧸 Kids
        </h1>
        <p className="text-[#6b7f99] text-sm mt-1">Conteúdo seguro e divertido para toda a família</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-start pt-3">
        {sections.slice(0, 3).map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}
