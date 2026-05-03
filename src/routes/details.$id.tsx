import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentRow } from "@/components/tv/ContentRow";
import type { ContentItem } from "@/server/tmdb.functions";
import {
  Play, Plus, Star, ArrowLeft, Clock, Calendar, Film, Users, X,
} from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="relative w-full h-[50vh] lg:h-[60vh] min-h-[350px] overflow-hidden">
        <img src={DEMO_DETAIL.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-3 rounded-xl bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors cursor-pointer no-underline text-base font-semibold"
        >
          <ArrowLeft className="w-6 h-6" />
          Voltar
        </a>
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-36 px-6 lg:px-12 pb-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Poster */}
          <div className="hidden lg:block shrink-0">
            <img
              src={DEMO_DETAIL.poster}
              alt={DEMO_DETAIL.title}
              className="w-72 rounded-2xl shadow-2xl shadow-black/50 border-2 border-border"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-2">{DEMO_DETAIL.title}</h1>
            <p className="text-sm text-muted-foreground mb-5">{DEMO_DETAIL.originalTitle}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 mb-6">
              <span className="flex items-center gap-1 text-yellow-400 font-bold text-xl">
                <Star className="w-6 h-6 fill-yellow-400" />
                {DEMO_DETAIL.rating}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground text-base">
                <Calendar className="w-5 h-5" /> {DEMO_DETAIL.year}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground text-base">
                <Clock className="w-5 h-5" /> {DEMO_DETAIL.duration}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground text-base">
                <Film className="w-5 h-5" /> {DEMO_DETAIL.mediaType === "tv" ? "Série" : "Filme"}
              </span>
            </div>

            {/* Genres */}
            <div className="flex gap-2 mb-8">
              {DEMO_DETAIL.genres.map(g => (
                <span key={g} className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  {g}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <a
                href={`/player/${id}`}
                className="tv-btn flex items-center gap-3 h-16 px-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg cursor-pointer hover:bg-primary/90 no-underline transition-all"
                tabIndex={0}
              >
                <Play className="w-6 h-6 fill-current" />
                Assistir
              </a>
              <button
                onClick={() => setShowTrailer(true)}
                className="tv-btn flex items-center gap-2 h-16 px-8 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base cursor-pointer hover:bg-secondary/80 transition-all"
                tabIndex={0}
              >
                <Play className="w-5 h-5" />
                Trailer
              </button>
              <button className="tv-btn flex items-center justify-center h-16 w-16 rounded-xl border-2 border-border text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-all" tabIndex={0}>
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Overview */}
            <p className="text-foreground/80 text-lg leading-relaxed mb-8 max-w-2xl">
              {DEMO_DETAIL.overview}
            </p>

            {/* Director & Cast */}
            <div className="space-y-3 text-base">
              <p><span className="text-muted-foreground">Diretor:</span> <span className="text-foreground font-semibold">{DEMO_DETAIL.director}</span></p>
              <p className="flex items-start gap-2">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <span><span className="text-muted-foreground">Elenco:</span> <span className="text-foreground">{DEMO_DETAIL.cast.join(", ")}</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Trailer modal */}
        {showTrailer && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
            <div className="relative w-full max-w-5xl aspect-video">
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-14 right-0 text-foreground hover:text-primary cursor-pointer transition-colors"
              >
                <X className="w-10 h-10" />
              </button>
              <iframe
                src={DEMO_DETAIL.trailerUrl}
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Similar */}
        <div className="mt-14">
          <ContentRow title="🎬 Recomendações Similares" items={SIMILAR} />
        </div>
      </div>
    </div>
  );
}
