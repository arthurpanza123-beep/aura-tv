import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { ContentRow } from "@/components/tv/ContentRow";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { fetchHomeData, type ContentSection } from "@/functions/tmdb.functions";

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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchHomeData()
      .then((data) => {
        const kidsSections = data.sections.filter((s) => s.id === "animation" || s.id === "family");
        if (kidsSections.length === 0 && data.sections.length > 0) {
          const allItems = data.sections.flatMap((s) => s.items);
          kidsSections.push({
            id: "kids_all",
            title: "Para as Crianças",
            items: allItems.slice(0, 20),
          });
        }
        setSections(kidsSections.length > 0 ? kidsSections : data.sections.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  if (loading || !showContent) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 1500 : 600} />;
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f1530 0%, #151a3a 30%, #0c1a2e 100%)" }}
    >
      <TVSidebar />
      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
        <div className="px-8 pt-6">
          <h1 className="text-2xl font-bold text-[#e8edf4]">🧸 Kids</h1>
          <p className="text-[#6b7f99] text-sm mt-1">
            Conteúdo seguro e divertido para toda a família
          </p>
        </div>
        <div className="py-4 space-y-2">
          {sections.map((section) => (
            <ContentRow key={section.id} title={section.title} items={section.items} />
          ))}
        </div>
      </main>
    </div>
  );
}
