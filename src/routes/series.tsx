import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import { fetchSeriesCategoriesFn, fetchSeriesFn, fetchSeriesInfoFn, getStreamUrlFn } from "@/server/iptv.functions";
import { Search, Clapperboard, AlertTriangle, Play, ArrowLeft, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Séries — Central Play Plus" },
      { name: "description", content: "Catálogo de séries do Central Play Plus" },
    ],
  }),
  component: SeriesPage,
});

interface SeriesCategory { category_id: string; category_name: string; }
interface SeriesItem {
  num: number; name: string; series_id: number; cover: string;
  plot: string; genre: string; releaseDate: string; rating: string;
  rating_5based: number; category_id: string; stream_url?: string;
}

const PAGE_SIZE = 60;

function SeriesPage() {
  const creds = useIptvCredentials();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [categories, setCategories] = useState<SeriesCategory[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Detail view
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [episodes, setEpisodes] = useState<Array<{ id: number; title: string; stream_url: string; cover: string }>>([]);
  // Player
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerStreamUrl, setPlayerStreamUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");

  useEffect(() => {
    if (!creds) return;
    let cancelled = false;
    async function loadData() {
      try {
        const [cats, seriesList] = await Promise.all([
          fetchSeriesCategoriesFn({ data: creds! }),
          fetchSeriesFn({ data: { ...creds! } }),
        ]);
        if (cancelled) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setSeries(Array.isArray(seriesList) ? seriesList : []);
      } catch (err) {
        console.error("Failed to load series:", err);
        if (!cancelled) setError("Erro ao carregar séries.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [creds]);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach(c => m.set(c.category_id, c.category_name));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = series;
    if (activeCategory !== "all") list = list.filter(s => s.category_id === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [series, activeCategory, searchTerm]);

  const visibleSeries = filtered.slice(0, visibleCount);

  const handleOpenDetails = async (item: SeriesItem) => {
    if (!creds) return;
    setSelectedSeries(item);
    setDetailLoading(true);
    setEpisodes([]);
    try {
      const result = await fetchSeriesInfoFn({ data: { ...creds, seriesId: item.series_id } });
      const parsed = JSON.parse(result.info);
      // Extract episodes from parsed data
      const eps: Array<{ id: number; title: string; stream_url: string; cover: string }> = [];
      if (parsed.episodes) {
        const seasonKeys = Object.keys(parsed.episodes);
        for (const key of seasonKeys) {
          const seasonEps = parsed.episodes[key];
          if (Array.isArray(seasonEps)) {
            for (const ep of seasonEps) {
              eps.push({
                id: ep.id || eps.length + 1,
                title: ep.title || ep.name || `Episódio ${eps.length + 1}`,
                stream_url: ep.stream_url || "",
                cover: ep.cover || ep.info?.movie_image || "",
              });
            }
          }
        }
      }
      setEpisodes(eps);
    } catch (err) {
      console.error("Series info error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleWatchEpisode = async (ep: { id: number; title: string; stream_url: string }) => {
    if (!creds) return;
    setPlayerTitle(`${selectedSeries?.name || "Série"} — ${ep.title}`);
    setShowPlayer(true);
    if (ep.stream_url) {
      // Direct URL from enigma2
      setPlayerStreamUrl(ep.stream_url);
    } else {
      try {
        const result = await getStreamUrlFn({ data: { ...creds, streamId: ep.id, type: "series" as const } });
        setPlayerStreamUrl(result.url);
      } catch {
        setPlayerStreamUrl("");
      }
    }
  };

  // Watch series directly (if it has a stream_url)
  const handleWatchDirect = async (item: SeriesItem) => {
    if (!creds) return;
    setPlayerTitle(item.name);
    setShowPlayer(true);
    if (item.stream_url) {
      setPlayerStreamUrl(item.stream_url);
    } else {
      try {
        const result = await getStreamUrlFn({ data: { ...creds, streamId: item.series_id, type: "series" as const } });
        setPlayerStreamUrl(result.url);
      } catch {
        setPlayerStreamUrl("");
      }
    }
  };

  if (!creds) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center">
          <p className="text-[#6b7f99] mb-4">Sessão expirada</p>
          <button onClick={() => navigate({ to: "/" })} className="px-6 py-2 bg-[#2a9af0] text-white rounded-lg cursor-pointer font-semibold">Fazer Login</button>
        </div>
      </div>
    );
  }

  if (!showContent) return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 2000 : 600} />;

  if (error) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0a1628" }}>
        <TVSidebar />
        <main className="flex-1 ml-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-[#e8edf4] text-lg mb-2 font-bold">Erro ao carregar</p>
            <p className="text-[#6b7f99] text-sm mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#2a9af0] text-white rounded-lg cursor-pointer font-semibold">Tentar Novamente</button>
          </div>
        </main>
      </div>
    );
  }

  if (showPlayer) {
    return <TVPlayer streamUrl={playerStreamUrl} title={playerTitle} subtitle="Série"
      onBack={() => { setShowPlayer(false); setPlayerStreamUrl(""); }} />;
  }

  // Series detail view
  if (selectedSeries) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}>
        <TVSidebar />
        <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="px-8 pt-6 pb-4">
            <button onClick={() => { setSelectedSeries(null); setEpisodes([]); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e8edf4] cursor-pointer text-sm font-semibold transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="flex gap-8 items-start">
              {selectedSeries.cover ? (
                <img src={selectedSeries.cover} alt={selectedSeries.name}
                  className="w-48 rounded-2xl shadow-2xl border border-[#1a2e48] shrink-0" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-48 aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#0f1e35] to-[#0a1628] border border-[#1a2e48] flex items-center justify-center shrink-0">
                  <Clapperboard className="w-12 h-12 text-[#1a2e48]" />
                </div>
              )}
              <div className="flex-1 pt-4">
                <h1 className="text-3xl font-black text-white mb-3">{selectedSeries.name}</h1>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  {selectedSeries.rating_5based > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400" /> {selectedSeries.rating_5based.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[#6b7f99]">{selectedSeries.genre || catMap.get(selectedSeries.category_id) || ""}</span>
                  {selectedSeries.releaseDate && <span className="text-[#6b7f99]">{selectedSeries.releaseDate.slice(0, 4)}</span>}
                </div>
                {selectedSeries.plot && (
                  <p className="text-[#8a9bb5] text-sm leading-relaxed max-w-2xl mb-4">{selectedSeries.plot}</p>
                )}
              </div>
            </div>
          </div>

          {/* Episodes */}
          <div className="px-8 py-4">
            <h2 className="text-lg font-bold text-[#e8edf4] mb-4">
              {detailLoading ? "Carregando episódios..." : `${episodes.length} episódio${episodes.length !== 1 ? "s" : ""}`}
            </h2>

            {detailLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-[#2a9af0] animate-spin mx-auto" />
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {episodes.map((ep, i) => (
                  <button key={ep.id}
                    onClick={() => handleWatchEpisode(ep)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#0f1e35]/80 transition-all cursor-pointer text-left group border border-transparent hover:border-[#2a9af0]/20">
                    <div className="w-12 h-12 rounded-lg bg-[#0f1e35] flex items-center justify-center shrink-0 group-hover:bg-[#2a9af0]/20 transition-colors">
                      <Play className="w-5 h-5 text-[#6b7f99] group-hover:text-[#2a9af0] fill-current transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{ep.title}</p>
                      <p className="text-[#6b7f99] text-xs">Episódio {i + 1}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clapperboard className="w-12 h-12 text-[#1a2e48] mx-auto mb-3" />
                <p className="text-[#6b7f99] mb-4">Nenhum episódio disponível</p>
                {selectedSeries.stream_url && (
                  <button onClick={() => handleWatchDirect(selectedSeries)}
                    className="px-6 py-2.5 bg-[#2a9af0] text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 mx-auto">
                    <Play className="w-4 h-4 fill-white" /> Assistir
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0c1a2e 100%)" }}>
      <TVSidebar />
      <main className="flex-1 ml-16 overflow-y-auto overflow-x-hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200 && visibleCount < filtered.length) {
            setVisibleCount(v => Math.min(v + PAGE_SIZE, filtered.length));
          }
        }}>
        <div className="sticky top-0 z-30 px-8 pt-6 pb-4" style={{ background: "linear-gradient(180deg, #0a1628 70%, transparent)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-[#e8edf4]">Séries</h1>
              <p className="text-[#4a5a70] text-xs mt-0.5">{filtered.length} títulos disponíveis</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a70]" />
              <input type="text" value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Buscar série..."
                className="pl-9 pr-3 py-2 bg-[#0f1e35] border border-[#1a2e48] rounded-xl text-sm text-[#e8edf4] placeholder:text-[#4a5a70] w-52 focus:border-[#2a9af0]/40 outline-none transition-colors" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => { setActiveCategory("all"); setVisibleCount(PAGE_SIZE); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                activeCategory === "all" ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40" : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
              }`}>
              Todas
            </button>
            {categories.map(cat => (
              <button key={cat.category_id}
                onClick={() => { setActiveCategory(cat.category_id); setVisibleCount(PAGE_SIZE); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                  activeCategory === cat.category_id ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40" : "bg-transparent text-[#6b7f99] border-[#1a2e48] hover:text-white hover:border-[#2a5580]"
                }`}>
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="grid grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 px-4">
            {visibleSeries.map((s) => (
              <SeriesCard key={`${s.series_id}-${s.num}`} item={s} catName={catMap.get(s.category_id) || ""}
                onOpen={handleOpenDetails} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="py-6 text-center">
              <div className="w-8 h-8 border-2 border-[#2a9af0]/30 border-t-[#2a9af0] rounded-full animate-spin mx-auto" />
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Clapperboard className="w-16 h-16 text-[#1a2e48] mx-auto mb-4" />
              <p className="text-[#6b7f99] text-lg">Nenhuma série encontrada</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SeriesCard({ item, catName, onOpen }: { item: SeriesItem; catName: string; onOpen: (s: SeriesItem) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="tv-card group relative flex-shrink-0 overflow-hidden bg-[#0f1e35] cursor-pointer w-full rounded-xl border border-transparent hover:border-[#2a9af0]/30 transition-all"
      style={{ aspectRatio: "2/3" }} tabIndex={0}
      onClick={() => onOpen(item)}>
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-[#0f1e35] animate-pulse flex items-center justify-center">
          <Clapperboard className="w-8 h-8 text-[#1a2e48]" />
        </div>
      )}
      {item.cover && !imgError ? (
        <img src={item.cover} alt={item.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy" onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1e35] to-[#0a1628] p-3">
          <Clapperboard className="w-10 h-10 text-[#1a2e48] mb-2" />
          <span className="text-[10px] text-[#6b7f99] text-center leading-tight">{item.name}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-xs font-bold text-white truncate mb-0.5">{item.name}</h3>
        <div className="flex items-center gap-1.5 text-[10px] mb-2">
          {item.rating_5based > 0 && (
            <span className="text-yellow-400 font-semibold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400" /> {item.rating_5based.toFixed(1)}
            </span>
          )}
          <span className="text-[#8a9bb5]">{catName}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onOpen(item); }}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#2a9af0] hover:bg-[#3aabff] text-white text-[11px] font-bold cursor-pointer transition-all shadow-md shadow-[#2a9af0]/20">
          <Clapperboard className="w-3 h-3" /> Ver Detalhes
        </button>
      </div>
    </div>
  );
}
