import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import { fetchSeriesInfoFn, getPlaybackUrlFn } from "@/functions/iptv.functions";
import { Play, ArrowLeft, Clapperboard, Loader2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/details/$id")({
  head: () => ({
    meta: [{ title: "Detalhes — Central Play Plus" }],
  }),
  component: DetailsPage,
});

interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: {
    duration?: string;
    plot?: string;
    movie_image?: string;
  };
}

interface Season {
  season_number: number;
  episodes: Episode[];
}

interface SeriesDetail {
  info?: {
    name?: string;
    cover?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    rating?: string;
    backdrop_path?: string[];
    youtube_trailer?: string;
  };
  seasons?: Record<string, Episode[]>;
  episodes?: Record<string, Episode[]>;
}

function DetailsPage() {
  const { id } = Route.useParams();
  const creds = useIptvCredentials();
  const navigate = useNavigate();
  const fetchSeriesInfo = useServerFn(fetchSeriesInfoFn);
  const getPlaybackUrl = useServerFn(getPlaybackUrlFn);

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SeriesDetail | null>(null);
  const [error, setError] = useState("");
  const [activeSeason, setActiveSeason] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerStreamUrl, setPlayerStreamUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");

  useEffect(() => {
    if (!creds) return;
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchSeriesInfo({ data: { ...creds, seriesId: id } });
        if (!cancelled) {
          const parsed: SeriesDetail = JSON.parse(result.info);
          setDetail(parsed);
          // Find first season
          const seasons = parsed.episodes || parsed.seasons;
          if (seasons) {
            const keys = Object.keys(seasons)
              .map(Number)
              .sort((a, b) => a - b);
            if (keys.length > 0) setActiveSeason(keys[0]);
          }
        }
      } catch (err) {
        console.error("Series info error:", err);
        if (!cancelled) setError("Erro ao carregar detalhes da série.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [creds, id, fetchSeriesInfo]);

  const handleWatchEpisode = async (episode: Episode) => {
    if (!creds) return;
    setPlayerTitle(
      `${detail?.info?.name || "Série"} — Ep ${episode.episode_num}: ${episode.title}`,
    );
    setShowPlayer(true);
    try {
      const result = await getPlaybackUrl({
        data: { ...creds, contentId: episode.id, type: "series" },
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
            className="px-6 py-2 bg-[#1a5a8a] text-white rounded-lg cursor-pointer"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (showPlayer) {
    return (
      <TVPlayer
        streamUrl={playerStreamUrl}
        title={playerTitle}
        subtitle="Série"
        onBack={() => {
          setShowPlayer(false);
          setPlayerStreamUrl("");
        }}
      />
    );
  }

  if (loading) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: "#0a1628" }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2a9af0] animate-spin mx-auto mb-4" />
          <p className="text-[#6b7f99]">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0a1628" }}>
        <TVSidebar />
        <main className="flex-1 ml-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-[#e8edf4] text-lg mb-2">Erro</p>
            <p className="text-[#6b7f99] text-sm mb-4">{error || "Série não encontrada"}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-[#1a5a8a] text-white rounded-lg cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const info = detail.info || {};
  const seasonsData = detail.episodes || detail.seasons || {};
  const seasonKeys = Object.keys(seasonsData)
    .map(Number)
    .sort((a, b) => a - b);
  const currentEpisodes = seasonsData[String(activeSeason)] || [];
  const backdrop = info.backdrop_path?.[0] || info.cover || "";

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}
    >
      <TVSidebar />

      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
        {/* Backdrop header */}
        <div className="relative w-full" style={{ height: "45vh", minHeight: 300 }}>
          {backdrop ? (
            <img
              src={backdrop}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e35] to-[#0a1628]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-[#0a1628]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 to-transparent" />

          <button
            onClick={() => window.history.back()}
            className="absolute top-5 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a1628]/60 backdrop-blur-sm text-[#e8edf4] hover:bg-[#0a1628]/80 cursor-pointer text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>

          <div className="absolute bottom-0 left-0 right-0 px-10 pb-6 flex items-end gap-8">
            {info.cover && (
              <img
                src={info.cover}
                alt={info.name}
                className="w-32 rounded-xl shadow-xl border border-[#1a2e48] hidden lg:block"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-2">{info.name || `Série #${id}`}</h1>
              <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
                {info.rating && Number(info.rating) > 0 && (
                  <span className="text-yellow-400 font-semibold">
                    ★ {Number(info.rating).toFixed(1)}
                  </span>
                )}
                {info.releaseDate && <span className="text-[#6b7f99]">{info.releaseDate}</span>}
                {info.genre && <span className="text-[#6b7f99]">{info.genre}</span>}
                {seasonKeys.length > 0 && (
                  <span className="text-[#6b7f99]">
                    {seasonKeys.length} temporada{seasonKeys.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {info.plot && (
                <p className="text-[#8a9bb5] text-sm leading-relaxed max-w-2xl line-clamp-3 mb-3">
                  {info.plot}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-[#6b7f99]">
                {info.director && (
                  <span>
                    Diretor: <span className="text-[#e8edf4]">{info.director}</span>
                  </span>
                )}
                {info.cast && (
                  <span>
                    Elenco:{" "}
                    <span className="text-[#e8edf4]">
                      {info.cast.slice(0, 80)}
                      {info.cast.length > 80 ? "..." : ""}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Season tabs + episodes */}
        <div className="px-10 py-6">
          {/* Season tabs */}
          {seasonKeys.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
              {seasonKeys.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSeason(s)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all border whitespace-nowrap ${
                    activeSeason === s
                      ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                      : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
                  }`}
                >
                  Temporada {s}
                </button>
              ))}
            </div>
          )}

          {seasonKeys.length === 1 && (
            <h2 className="text-lg font-bold text-[#e8edf4] mb-4">
              Temporada {seasonKeys[0]} · Episódios
            </h2>
          )}

          {/* Episodes grid */}
          {currentEpisodes.length > 0 ? (
            <div className="space-y-2">
              {currentEpisodes.map((ep) => (
                <EpisodeRow key={ep.id} episode={ep} onWatch={handleWatchEpisode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clapperboard className="w-12 h-12 text-[#1a2e48] mx-auto mb-3" />
              <p className="text-[#6b7f99]">Nenhum episódio disponível para esta temporada.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EpisodeRow({ episode, onWatch }: { episode: Episode; onWatch: (ep: Episode) => void }) {
  const [imgError, setImgError] = useState(false);
  const thumb = episode.info?.movie_image;

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#0f1e35]/80 transition-all group">
      {/* Thumbnail */}
      <div className="w-40 aspect-video rounded-lg overflow-hidden bg-[#0f1e35] shrink-0 relative">
        {thumb && !imgError ? (
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Clapperboard className="w-8 h-8 text-[#1a2e48]" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold mb-0.5">
          Ep {episode.episode_num}
          {episode.title ? ` — ${episode.title}` : ""}
        </p>
        {episode.info?.duration && (
          <p className="text-[#6b7f99] text-xs">{episode.info.duration}</p>
        )}
        {episode.info?.plot && (
          <p className="text-[#6b7f99] text-xs line-clamp-2 mt-1">{episode.info.plot}</p>
        )}
      </div>

      {/* Watch button */}
      <button
        onClick={() => onWatch(episode)}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2a9af0]/80 hover:bg-[#2a9af0] text-white text-xs font-semibold cursor-pointer transition-all"
      >
        <Play className="w-3 h-3 fill-white" /> Assistir
      </button>
    </div>
  );
}
