import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/tv/Navbar";
import { Bookmark } from "lucide-react";
import { ContentCard } from "@/components/tv/ContentCard";
import type { ContentItem } from "@/server/tmdb.functions";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [
      { title: "Minha Lista — Central Play Plus" },
    ],
  }),
  component: MyListPage,
});

const SAVED_ITEMS: ContentItem[] = [
  { id: 550, title: "Clube da Luta", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "", overview: "", rating: 8.4, year: "1999", mediaType: "movie" },
  { id: 238, title: "O Poderoso Chefão", poster: "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop: "", overview: "", rating: 8.7, year: "1972", mediaType: "movie" },
  { id: 1396, title: "Breaking Bad", poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop: "", overview: "", rating: 8.9, year: "2008", mediaType: "tv" },
  { id: 155, title: "Batman: O Cavaleiro das Trevas", poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg", backdrop: "", overview: "", rating: 8.5, year: "2008", mediaType: "movie" },
  { id: 100088, title: "The Last of Us", poster: "https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", backdrop: "", overview: "", rating: 8.8, year: "2023", mediaType: "tv" },
];

function MyListPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="my-list" />
      
      <div className="pt-24 lg:pt-28 px-6 lg:px-12">
        <div className="flex items-center gap-4 mb-10">
          <Bookmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl lg:text-5xl font-black text-foreground">Minha Lista</h1>
          <span className="text-base text-muted-foreground ml-3">({SAVED_ITEMS.length} itens)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {SAVED_ITEMS.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {SAVED_ITEMS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <Bookmark className="w-20 h-20 text-muted-foreground/30 mb-6" />
            <p className="text-xl text-muted-foreground">Sua lista está vazia</p>
            <p className="text-base text-muted-foreground/70 mt-2">Adicione filmes e séries para assistir depois</p>
          </div>
        )}
      </div>
    </div>
  );
}
