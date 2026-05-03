import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentCard } from "@/components/tv/ContentCard";
import type { ContentItem } from "@/server/tmdb.functions";
import { Play, Plus, Star, ArrowLeft, Clock, Calendar, Film, Users, X } from "lucide-react";

export const Route = createFileRoute("/details/$id")({
  head: () => ({
    meta: [{ title: "Detalhes — Central Play Plus" }],
  }),
  component: DetailsPage,
});

const DEMO_DETAIL = {
  id: 550,
  title: "Clube da Luta",
  originalTitle: "Fight Club",
  poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdrop: "https://image.tmdb.org/t/p/original/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
  overview: "Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabonetes chamado Tyler Durden. Eles formam um clube clandestino de luta que evolui para algo muito mais perigoso.",
  rating: 8.4,
  year: "1999",
  duration: "2h 19min",
  genres: ["Drama", "Thriller", "Comédia"],
  director: "David Fincher",
  cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
  trailerUrl: "https://www.youtube.com/embed/SUXWAEX2jlg",
  mediaType: "movie" as const,
};

const SIMILAR: ContentItem[] = [
  { id: 680, title: "Pulp Fiction", poster: "https://image.tmdb.org/t/p/w342/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg", backdrop: "", overview: "", rating: 8.5, year: "1994", mediaType: "movie" },
  { id: 278, title: "Um Sonho de Liberdade", poster: "https://image.tmdb.org/t/p/w342/9cqNcoGLjRiIgTGufGMiQ6EpJNN.jpg", backdrop: "", overview: "", rating: 8.7, year: "1994", mediaType: "movie" },
  { id: 155, title: "Batman: O Cavaleiro das Trevas", poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg", backdrop: "", overview: "", rating: 8.5, year: "2008", mediaType: "movie" },
  { id: 238, title: "O Poderoso Chefão", poster: "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop: "", overview: "", rating: 8.7, year: "1972", mediaType: "movie" },
  { id: 13, title: "Forrest Gump", poster: "https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop: "", overview: "", rating: 8.5, year: "1994", mediaType: "movie" },
];

function DetailsPage() {
  const { id } = Route.useParams();
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div className="tv-shell" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)" }}>
      {/* Top half - backdrop */}
      <div className="relative w-full flex-shrink-0" style={{ height: "45vh" }}>
        <img src={DEMO_DETAIL.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/50 to-[#0a1628]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 to-transparent" />

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="absolute top-5 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a1628]/60 backdrop-blur-sm text-[#e8edf4] hover:bg-[#0a1628]/80 cursor-pointer no-underline text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </a>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-5 flex items-end gap-8">
          <img src={DEMO_DETAIL.poster} alt={DEMO_DETAIL.title} className="w-36 rounded-xl shadow-xl border border-[#1a2e48] hidden lg:block" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">{DEMO_DETAIL.title}</h1>
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Star className="w-4 h-4 fill-yellow-400" /> {DEMO_DETAIL.rating}
              </span>
              <span className="text-[#6b7f99]">{DEMO_DETAIL.year}</span>
              <span className="text-[#6b7f99]">{DEMO_DETAIL.duration}</span>
              <span className="text-[#6b7f99]">Filme</span>
            </div>
            <div className="flex gap-2 mb-3">
              {DEMO_DETAIL.genres.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-[#1a5a8a]/15 text-[#2a7ab0] text-xs font-semibold border border-[#2a7ab0]/20">{g}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href={`/player/${id}`} className="tv-btn flex items-center gap-2 h-10 px-6 rounded-lg bg-[#1a5a8a] hover:bg-[#1e6a9e] text-white font-bold text-sm cursor-pointer no-underline transition-all" tabIndex={0}>
                <Play className="w-4 h-4 fill-current" /> Assistir
              </a>
              <button onClick={() => setShowTrailer(true)} className="tv-btn flex items-center gap-2 h-10 px-5 rounded-lg bg-[#162a42] hover:bg-[#1a3050] text-[#c8d4e0] font-semibold text-sm cursor-pointer transition-all" tabIndex={0}>
                <Play className="w-4 h-4" /> Trailer
              </button>
              <button className="tv-btn h-10 w-10 rounded-lg border border-[#1a2e48] text-[#6b7f99] flex items-center justify-center cursor-pointer hover:border-[#2a7ab0] hover:text-[#2a7ab0] transition-all" tabIndex={0}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom half - info + similar */}
      <div className="flex-1 min-h-0 flex flex-col px-10 pt-4">
        <div className="flex gap-8 mb-4">
          <p className="text-[#8a9bb5] text-sm leading-relaxed max-w-xl flex-1">{DEMO_DETAIL.overview}</p>
          <div className="text-sm space-y-1 shrink-0">
            <p><span className="text-[#6b7f99]">Diretor:</span> <span className="text-[#e8edf4] font-medium">{DEMO_DETAIL.director}</span></p>
            <p><span className="text-[#6b7f99]">Elenco:</span> <span className="text-[#e8edf4]">{DEMO_DETAIL.cast.join(", ")}</span></p>
          </div>
        </div>

        <h2 className="text-base font-bold text-[#e8edf4] mb-2">Recomendações</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {SIMILAR.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>

      {showTrailer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl aspect-video">
            <button onClick={() => setShowTrailer(false)} className="absolute -top-12 right-0 text-white hover:text-[#2a7ab0] cursor-pointer"><X className="w-8 h-8" /></button>
            <iframe src={DEMO_DETAIL.trailerUrl} className="w-full h-full rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
