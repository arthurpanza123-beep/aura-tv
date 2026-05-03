import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import {
  fetchVodCategoriesFn,
  fetchVodStreamsFn,
  getPlaybackUrlFn,
} from "@/functions/iptv.functions";
import { Search, SlidersHorizontal, Play, Film, AlertTriangle, Star } from "lucide-react";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Filmes — Central Play Plus" },
      { name: "description", content: "Catálogo de filmes do Central Play Plus" },
    ],
  }),
  component: MoviesPage,
});

interface VodCategory {
  category_id: string;
  category_name: string;
}
interface VodItem {
  id: string;
  num: number;
  name: string;
  stream_id: string;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
}

const PAGE_SIZE = 60;

function MoviesPage() {
  const creds = useIptvCredentials();
  const navigate = useNavigate();
  const fetchVodCategories = useServerFn(fetchVodCategoriesFn);
  const fetchVodStreams = useServerFn(fetchVodStreamsFn);
  const getPlaybackUrl = useServerFn(getPlaybackUrlFn);

  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [movies, setMovies] = useState<VodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerStreamUrl, setPlayerStreamUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<VodItem | null>(null);

  useEffect(() => {
    if (!creds) return;
    let cancelled = false;
    async function loadData() {
      try {
        const [cats, vods] = await Promise.all([
          fetchVodCategories({ data: creds! }),
          fetchVodStreams({ data: { ...creds! } }),
        ]);
        if (cancelled) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setMovies(Array.isArray(vods) ? vods : []);
      } catch (err) {
        console.error("Failed to load movies:", err);
        if (!cancelled) setError("Erro ao carregar filmes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [creds, fetchVodCategories, fetchVodStreams]);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.category_id, c.category_name));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = movies;
    if (activeCategory !== "all") list = list.filter((m) => m.category_id === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return (b.rating_5based || 0) - (a.rating_5based || 0);
      if (sortBy === "newest") return (b.added || "").localeCompare(a.added || "");
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [movies, activeCategory, searchTerm, sortBy]);

  const visibleMovies = filtered.slice(0, visibleCount);

  const handleWatch = async (movie: VodItem) => {
    if (!creds) return;
    setPlayerTitle(movie.name);
    setShowPlayer(true);
    try {
      const result = await getPlaybackUrl({
        data: { ...creds, contentId: movie.id, type: "movie" as const },
      });
      setPlayerStreamUrl(result.url);
    } catch {
      setPlayerStreamUrl("");
    }
  };

  if (!creds) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: "#0a1628" }}
      >
        <div className="text-center">
          <p className="text-[#6b7f99] mb-4">Sessão expirada</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="px-6 py-2 bg-[#2a9af0] text-white rounded-lg cursor-pointer font-semibold"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (!showContent)
    return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 2000 : 600} />;

  if (error) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0a1628" }}>
        <TVSidebar />
        <main className="flex-1 ml-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-[#e8edf4] text-lg mb-2 font-bold">Erro ao carregar</p>
            <p className="text-[#6b7f99] text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#2a9af0] text-white rounded-lg cursor-pointer font-semibold"
            >
              Tentar Novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (showPlayer) {
    return (
      <TVPlayer
        streamUrl={playerStreamUrl}
        title={playerTitle}
        subtitle="Filme"
        onBack={() => {
          setShowPlayer(false);
          setPlayerStreamUrl("");
        }}
      />
    );
  }

  // Movie detail overlay
  if (selectedMovie) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0a1628" }}>
        <TVSidebar />
        <main className="flex-1 ml-16 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full flex gap-8">
            {/* Poster */}
            <div className="w-64 shrink-0">
              {selectedMovie.stream_icon ? (
                <img
                  src={selectedMovie.stream_icon}
                  alt={selectedMovie.name}
                  className="w-full rounded-2xl shadow-2xl border border-[#1a2e48]"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#0f1e35] to-[#0a1628] border border-[#1a2e48] flex flex-col items-center justify-center">
                  <Film className="w-16 h-16 text-[#1a2e48] mb-3" />
                  <span className="text-[#6b7f99] text-sm text-center px-4">
                    {selectedMovie.name}
                  </span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-3xl font-black text-white mb-3">{selectedMovie.name}</h1>
              <div className="flex items-center gap-4 mb-5 text-sm">
                {selectedMovie.rating_5based > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400" />{" "}
                    {selectedMovie.rating_5based.toFixed(1)}
                  </span>
                )}
                <span className="text-[#6b7f99]">
                  {catMap.get(selectedMovie.category_id) || ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleWatch(selectedMovie)}
                  className="flex items-center gap-2 px-8 py-3 bg-[#2a9af0] hover:bg-[#3aabff] text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-[#2a9af0]/20"
                >
                  <Play className="w-5 h-5 fill-white" /> Assistir
                </button>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold cursor-pointer transition-all"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}
    >
      <TVSidebar />
      <main
        className="flex-1 ml-16 overflow-y-auto overflow-x-hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (
            el.scrollTop + el.clientHeight >= el.scrollHeight - 200 &&
            visibleCount < filtered.length
          ) {
            setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
          }
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-30 px-8 pt-6 pb-4"
          style={{ background: "linear-gradient(180deg, #0a1628 70%, transparent)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-[#e8edf4]">Filmes</h1>
              <p className="text-[#4a5a70] text-xs mt-0.5">
                Mostrando {visibleMovies.length} de {filtered.length} títulos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a70]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Buscar filme..."
                  className="pl-9 pr-3 py-2 bg-[#0f1e35] border border-[#1a2e48] rounded-xl text-sm text-[#e8edf4] placeholder:text-[#4a5a70] w-52 focus:border-[#2a9af0]/40 outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#6b7f99]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0f1e35] border border-[#1a2e48] rounded-xl px-3 py-2 text-sm text-[#c8d4e0] cursor-pointer outline-none"
                >
                  <option value="name">A-Z</option>
                  <option value="rating">Avaliação</option>
                  <option value="newest">Recentes</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setActiveCategory("all");
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                  : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => {
                  setActiveCategory(cat.category_id);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                  activeCategory === cat.category_id
                    ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                    : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="px-4 pb-8">
          <div className="grid grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 px-4">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                catName={catMap.get(movie.category_id) || ""}
                onWatch={handleWatch}
                onDetails={setSelectedMovie}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="py-6 text-center">
              <div className="w-8 h-8 border-2 border-[#2a9af0]/30 border-t-[#2a9af0] rounded-full animate-spin mx-auto" />
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Film className="w-16 h-16 text-[#1a2e48] mx-auto mb-4" />
              <p className="text-[#6b7f99] text-lg">Nenhum filme encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MovieCard({
  movie,
  catName,
  onWatch,
  onDetails,
}: {
  movie: VodItem;
  catName: string;
  onWatch: (m: VodItem) => void;
  onDetails: (m: VodItem) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="tv-card group relative flex-shrink-0 overflow-hidden bg-[#0f1e35] cursor-pointer w-full rounded-xl border border-transparent hover:border-[#2a9af0]/30 transition-all"
      style={{ aspectRatio: "2/3" }}
      tabIndex={0}
      onClick={() => onDetails(movie)}
    >
      {/* Skeleton */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-[#0f1e35] animate-pulse flex items-center justify-center">
          <Film className="w-8 h-8 text-[#1a2e48]" />
        </div>
      )}
      {/* Image */}
      {movie.stream_icon && !imgError ? (
        <img
          src={movie.stream_icon}
          alt={movie.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1e35] to-[#0a1628] p-3">
          <Film className="w-10 h-10 text-[#1a2e48] mb-2" />
          <span className="text-[10px] text-[#6b7f99] text-center leading-tight">{movie.name}</span>
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-xs font-bold text-white truncate mb-0.5">{movie.name}</h3>
        <div className="flex items-center gap-1.5 text-[10px] mb-2">
          {movie.rating_5based > 0 && (
            <span className="text-yellow-400 font-semibold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400" /> {movie.rating_5based.toFixed(1)}
            </span>
          )}
          <span className="text-[#8a9bb5]">{catName}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatch(movie);
          }}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#2a9af0] hover:bg-[#3aabff] text-white text-[11px] font-bold cursor-pointer transition-all shadow-md shadow-[#2a9af0]/20"
        >
          <Play className="w-3 h-3 fill-white" /> Assistir
        </button>
      </div>
    </div>
  );
}
