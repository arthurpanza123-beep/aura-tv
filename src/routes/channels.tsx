import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Play, X, ChevronUp, Search, Radio, AlertTriangle } from "lucide-react";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import {
  fetchLiveCategoriesFn,
  fetchLiveStreamsFn,
  getPlaybackUrlFn,
} from "@/functions/iptv.functions";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [{ title: "Canais ao Vivo — Central Play Plus" }],
  }),
  component: ChannelsPage,
});

interface IptvCategory {
  category_id: string;
  category_name: string;
}
interface IptvChannel {
  id: string;
  num: number;
  name: string;
  stream_id: string;
  stream_icon: string;
  category_id: string;
  epg_channel_id: string | null;
  tv_archive: number;
}

const PAGE_SIZE = 80;

function ChannelsPage() {
  const creds = useIptvCredentials();
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const fetchLiveCategories = useServerFn(fetchLiveCategoriesFn);
  const fetchLiveStreams = useServerFn(fetchLiveStreamsFn);
  const getPlaybackUrl = useServerFn(getPlaybackUrlFn);

  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [categories, setCategories] = useState<IptvCategory[]>([]);
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [playerStreamUrl, setPlayerStreamUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!creds) return;
    let cancelled = false;
    async function loadData() {
      try {
        const [cats, streams] = await Promise.all([
          fetchLiveCategories({ data: creds! }),
          fetchLiveStreams({ data: { ...creds! } }),
        ]);
        if (cancelled) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setChannels(Array.isArray(streams) ? streams : []);
      } catch (err) {
        console.error("Failed to load channels:", err);
        if (!cancelled) setError("Erro ao carregar canais. Tente novamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [creds, fetchLiveCategories, fetchLiveStreams]);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.category_id, c.category_name));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = channels;
    if (activeCategory !== "all") list = list.filter((c) => c.category_id === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [channels, activeCategory, searchTerm]);

  const visibleChannels = filtered.slice(0, visibleCount);
  const selected = filtered[selectedIndex] || filtered[0];

  // Auto-scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement;
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "Enter") {
        if (selected) handleWatch(selected);
      } else if (e.key === "Escape") {
        setShowOverlay((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered.length, selected]);

  const handleWatch = async (channel: IptvChannel) => {
    if (!creds) return;
    setPlayerTitle(channel.name);
    setShowPlayer(true);
    try {
      const result = await getPlaybackUrl({
        data: { ...creds, contentId: channel.id, type: "live" as const },
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

  if (!showContent) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={loading ? 2000 : 600} />;
  }

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
        subtitle="Canal ao Vivo"
        onBack={() => {
          setShowPlayer(false);
          setPlayerStreamUrl("");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#000" }}>
      <TVSidebar />
      <main className="flex-1 ml-16 relative">
        {/* Channel preview area */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "radial-gradient(ellipse at center, #0d1f3c 0%, #050d1a 100%)" }}
        >
          {selected ? (
            <div className="text-center animate-in fade-in duration-300">
              {selected.stream_icon ? (
                <img
                  src={selected.stream_icon}
                  alt={selected.name}
                  className="w-24 h-24 object-contain mx-auto mb-5 rounded-xl shadow-2xl shadow-[#2a9af0]/10"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-[#0f1e35] flex items-center justify-center mx-auto mb-5 border border-[#1a2e48]">
                  <Radio className="w-10 h-10 text-[#2a9af0]/30" />
                </div>
              )}
              <p className="text-white/30 text-2xl font-black tracking-wide">{selected.name}</p>
              <p className="text-[#2a9af0]/50 text-sm mt-2 font-medium">
                {catMap.get(selected.category_id) || ""}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleWatch(selected)}
                  className="px-8 py-3 bg-[#2a9af0] hover:bg-[#3aabff] text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-[#2a9af0]/20 flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5 fill-white" /> Assistir
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/10 text-xl">Selecione um canal</p>
          )}
        </div>

        {/* Channel info badge top-left */}
        {selected && (
          <div className="absolute top-4 left-6 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-xl px-4 py-2.5">
            {selected.stream_icon && (
              <img
                src={selected.stream_icon}
                alt=""
                className="w-8 h-6 object-contain rounded"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <p className="text-white text-sm font-bold leading-tight">{selected.name}</p>
              <p className="text-white/50 text-[10px]">{catMap.get(selected.category_id) || ""}</p>
            </div>
            <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ml-1 animate-pulse">
              AO VIVO
            </span>
          </div>
        )}

        {/* Channel List Overlay */}
        {showOverlay && (
          <div
            className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(270deg, rgba(6,10,22,0.97) 0%, rgba(6,10,22,0.85) 70%, transparent 100%)",
            }}
          >
            {/* Search */}
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a70]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(0);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Buscar canal..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0f1e35] border border-[#1a2e48] rounded-xl text-sm text-[#e8edf4] placeholder:text-[#4a5a70] focus:border-[#2a9af0]/40 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 px-4 pb-2 max-h-28 overflow-y-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSelectedIndex(0);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all border ${
                  activeCategory === "all"
                    ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                    : "bg-transparent text-[#6b7f99] border-[#1a2e48]/50 hover:text-white"
                }`}
              >
                Todos ({channels.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => {
                    setActiveCategory(cat.category_id);
                    setSelectedIndex(0);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all border ${
                    activeCategory === cat.category_id
                      ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                      : "bg-transparent text-[#6b7f99] border-[#1a2e48]/50 hover:text-white"
                  }`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>

            <p className="px-4 text-[10px] text-[#4a5a70] mb-1 font-medium">
              Mostrando {visibleChannels.length} de {filtered.length} canais
            </p>

            {/* Channel list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-2 space-y-0.5 no-scrollbar"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (
                  el.scrollTop + el.clientHeight >= el.scrollHeight - 100 &&
                  visibleCount < filtered.length
                ) {
                  setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
                }
              }}
            >
              {visibleChannels.map((channel, i) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => handleWatch(channel)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    i === selectedIndex
                      ? "bg-[#2a9af0]/15 border border-[#2a9af0]/30 shadow-lg shadow-[#2a9af0]/5"
                      : "bg-transparent border border-transparent hover:bg-white/5"
                  }`}
                  tabIndex={0}
                >
                  <span className="text-[#4a6a8a] text-[11px] font-bold w-7 text-right shrink-0 tabular-nums">
                    {String(channel.num || i + 1).padStart(3, "0")}
                  </span>
                  {channel.stream_icon ? (
                    <img
                      src={channel.stream_icon}
                      alt=""
                      className="w-10 h-7 object-contain rounded shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const next = img.nextElementSibling;
                        if (next) (next as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-7 rounded bg-gradient-to-br from-[#1a2e48] to-[#0f1e35] items-center justify-center shrink-0 ${channel.stream_icon ? "hidden" : "flex"}`}
                  >
                    <span className="text-[7px] font-black text-[#4a6a8a] uppercase">
                      {channel.name.slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                    <p className="text-[#6b7f99] text-[10px] truncate">
                      {catMap.get(channel.category_id) || ""}
                    </p>
                  </div>
                  {i === selectedIndex && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatch(channel);
                      }}
                      className="shrink-0 w-7 h-7 rounded-full bg-[#2a9af0] flex items-center justify-center cursor-pointer hover:bg-[#3aabff] transition-colors shadow-md shadow-[#2a9af0]/30"
                    >
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </button>
                  )}
                </button>
              ))}
              {visibleCount < filtered.length && (
                <div className="py-4 text-center">
                  <div className="w-6 h-6 border-2 border-[#2a9af0]/30 border-t-[#2a9af0] rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle overlay */}
        <button
          onClick={() => setShowOverlay((o) => !o)}
          className="absolute bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-all border border-white/10"
        >
          {showOverlay ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </main>
    </div>
  );
}
