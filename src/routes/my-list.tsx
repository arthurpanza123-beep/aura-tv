import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/tv/Navbar";
import { Bookmark } from "lucide-react";
import { ContentCard } from "@/components/tv/ContentCard";
import type { ContentItem } from "@/server/tmdb.functions";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [{ title: "Minha Lista — Central Play Plus" }],
  }),
  component: MyListPage,
});

const SAVED_ITEMS: ContentItem[] = [
  { id: 550, title: "Clube da Luta", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "", overview: "", rating: 8.4, year: "1999", mediaType: "movie" },
  { id: 238, title: "O Poderoso Chefão", poster: "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop: "", overview: "", rating: 8.7, year: "1972", mediaType: "movie" },
  { id: 1396, title: "Breaking Bad", poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop: "", overview: "", rating: 8.9, year: "2008", mediaType: "tv" },
  { id: 155, title: "Batman: O Cavaleiro das Trevas", poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg", backdrop: "", overview: "", rating: 8.5, year: "2008", mediaType: "movie" },
  { id: 100088, title: "The Last of Us", poster: "https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", backdrop: "", overview: "", rating: 8.8, year: "2023", mediaType: "tv" },
  { id: 680, title: "Pulp Fiction", poster: "https://image.tmdb.org/t/p/w342/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg", backdrop: "", overview: "", rating: 8.5, year: "1994", mediaType: "movie" },
  { id: 278, title: "Um Sonho de Liberdade", poster: "https://image.tmdb.org/t/p/w342/9cqNcoGLjRiIgTGufGMiQ6EpJNN.jpg", backdrop: "", overview: "", rating: 8.7, year: "1994", mediaType: "movie" },
  { id: 13, title: "Forrest Gump", poster: "https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop: "", overview: "", rating: 8.5, year: "1994", mediaType: "movie" },
];

function MyListPage() {
  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)" }}>
      <Navbar activeTab="my-list" />

      <div className="pt-16 px-10 flex items-center gap-3 mb-4">
        <Bookmark className="w-5 h-5 text-[#2a7ab0]" />
        <h1 className="text-2xl font-bold text-[#e8edf4]">Minha Lista</h1>
        <span className="text-sm text-[#6b7f99]">({SAVED_ITEMS.length} itens)</span>
      </div>

      <div className="flex-1 min-h-0 px-10 overflow-x-auto">
        <div className="flex gap-3 pb-4">
          {SAVED_ITEMS.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
