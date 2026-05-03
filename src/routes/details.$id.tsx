import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/tv/Navbar";
import { ContentRow } from "@/components/tv/ContentRow";
import type { ContentItem } from "@/server/tmdb.functions";
import {
  Play, Plus, Star, ArrowLeft, Clock, Calendar, Film, Users,
  Maximize, Volume2, VolumeX, Settings, Subtitles, PictureInPicture2,
  SkipBack, SkipForward, Pause, X,
} from "lucide-react";

export const Route = createFileRoute("/details/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes — Central Play Plus" },
    ],
  }),
  component: DetailsPage,
});

// Demo detail data
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
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  if (showPlayer) {
    return <VideoPlayer onClose={() => setShowPlayer(false)} title={DEMO_DETAIL.title} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="relative w-full h-[50vh] min-h-[350px] overflow-hidden">
        <img src={DEMO_DETAIL.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-32 px-6 lg:px-12 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="hidden lg:block shrink-0">
            <img
              src={DEMO_DETAIL.poster}
              alt={DEMO_DETAIL.title}
              className="w-64 rounded-xl shadow-2xl shadow-black/50 border border-border"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-2">{DEMO_DETAIL.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{DEMO_DETAIL.originalTitle}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                <Star className="w-5 h-5 fill-yellow-400" />
                {DEMO_DETAIL.rating}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" /> {DEMO_DETAIL.year}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" /> {DEMO_DETAIL.duration}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Film className="w-4 h-4" /> {DEMO_DETAIL.mediaType === "tv" ? "Série" : "Filme"}
              </span>
            </div>

            {/* Genres */}
            <div className="flex gap-2 mb-6">
              {DEMO_DETAIL.genres.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {g}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setShowPlayer(true)}
                className="tv-btn flex items-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-base cursor-pointer hover:bg-primary/90"
              >
                <Play className="w-5 h-5 fill-current" />
                Assistir
              </button>
              <button
                onClick={() => setShowTrailer(true)}
                className="tv-btn flex items-center gap-2 h-14 px-6 rounded-xl bg-secondary text-secondary-foreground font-semibold cursor-pointer hover:bg-secondary/80"
              >
                <Play className="w-5 h-5" />
                Trailer
              </button>
              <button className="tv-btn flex items-center justify-center h-14 w-14 rounded-xl border-2 border-border text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <p className="text-foreground/80 text-base leading-relaxed mb-6 max-w-2xl">
              {DEMO_DETAIL.overview}
            </p>

            {/* Director & Cast */}
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Diretor:</span> <span className="text-foreground font-medium">{DEMO_DETAIL.director}</span></p>
              <p className="flex items-start gap-1">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span><span className="text-muted-foreground">Elenco:</span> <span className="text-foreground">{DEMO_DETAIL.cast.join(", ")}</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Trailer modal */}
        {showTrailer && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl aspect-video">
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 text-foreground hover:text-primary cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>
              <iframe
                src={DEMO_DETAIL.trailerUrl}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Similar */}
        <div className="mt-12">
          <ContentRow title="🎬 Recomendações Similares" items={SIMILAR} />
        </div>
      </div>
    </div>
  );
}

/* ─── Video Player ─── */
interface VideoPlayerProps {
  onClose: () => void;
  title: string;
}

function VideoPlayer({ onClose, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [showQuality, setShowQuality] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Fake video background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <span className="text-muted-foreground/20 text-2xl">🎬 {title}</span>
      </div>

      {/* Controls overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-foreground hover:text-primary cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">{title}</span>
          </button>
        </div>

        {/* Center play/pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-8">
            <button className="text-foreground/70 hover:text-foreground cursor-pointer">
              <SkipBack className="w-10 h-10" />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-20 h-20 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/30 cursor-pointer"
            >
              {playing ? <Pause className="w-10 h-10 text-foreground" /> : <Play className="w-10 h-10 text-foreground fill-current" />}
            </button>
            <button className="text-foreground/70 hover:text-foreground cursor-pointer">
              <SkipForward className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress bar */}
          <div className="w-full mb-4 group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}>
            <div className="w-full h-1 group-hover:h-2 rounded-full bg-foreground/20 transition-all">
              <div className="h-full rounded-full bg-primary relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/70">0:48:23 / 2:19:00</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <button onClick={() => setMuted(!muted)} className="text-foreground/70 hover:text-foreground cursor-pointer">
                {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {/* Subtitles */}
              <div className="relative">
                <button onClick={() => setShowSubtitles(!showSubtitles)} className="text-foreground/70 hover:text-foreground cursor-pointer">
                  <Subtitles className="w-6 h-6" />
                </button>
                {showSubtitles && (
                  <div className="absolute bottom-10 right-0 bg-card rounded-lg p-3 min-w-[160px] shadow-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Legendas</p>
                    {["Desligado", "Português", "English", "Español"].map(s => (
                      <button key={s} className="block w-full text-left text-sm py-1 px-2 rounded hover:bg-secondary text-foreground cursor-pointer">{s}</button>
                    ))}
                    <p className="text-xs text-muted-foreground mb-2 mt-3 font-semibold">Áudio</p>
                    {["Português (BR)", "English", "Español"].map(a => (
                      <button key={a} className="block w-full text-left text-sm py-1 px-2 rounded hover:bg-secondary text-foreground cursor-pointer">{a}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality */}
              <div className="relative">
                <button onClick={() => setShowQuality(!showQuality)} className="text-foreground/70 hover:text-foreground cursor-pointer flex items-center gap-1">
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">{quality}</span>
                </button>
                {showQuality && (
                  <div className="absolute bottom-10 right-0 bg-card rounded-lg p-2 min-w-[120px] shadow-xl border border-border">
                    {["Auto", "4K", "1080p", "720p", "480p"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setQuality(q); setShowQuality(false); }}
                        className={`block w-full text-left text-sm py-1.5 px-3 rounded cursor-pointer ${quality === q ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
                      >{q}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button className="text-foreground/70 hover:text-foreground cursor-pointer">
                <PictureInPicture2 className="w-6 h-6" />
              </button>

              {/* Fullscreen */}
              <button className="text-foreground/70 hover:text-foreground cursor-pointer">
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
