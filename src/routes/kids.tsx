import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import { fetchHomeData, type ContentSection } from "@/server/tmdb.functions";
import { Loader2, Star } from "lucide-react";

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
      const kidsSections = data.sections.filter(s => 
        s.id === "animation" || s.id === "family"
      );
      // If no animation section, create a filtered one
      if (kidsSections.length === 0 && data.sections.length > 0) {
        const allItems = data.sections.flatMap(s => s.items);
        kidsSections.push({
          id: "kids_all",
          title: "✨ Para as Crianças",
          items: allItems.slice(0, 20),
        });
      }
      setSections(kidsSections.length > 0 ? kidsSections : data.sections.slice(0, 4));
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

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, oklch(0.15 0.06 300), oklch(0.05 0.005 260) 40%)" }}>
      <Navbar activeTab="kids" />
      
      {/* Kids Header */}
      <div className="pt-24 pb-8 px-6 lg:px-12">
        <h1 className="text-4xl lg:text-5xl font-black" style={{ color: "oklch(0.7 0.2 330)" }}>
          🧸 Kids
        </h1>
        <p className="text-muted-foreground mt-2">Conteúdo seguro e divertido para toda a família</p>
      </div>

      {/* Content */}
      <div>
        {sections.map((section) => (
          <ContentRow key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}
