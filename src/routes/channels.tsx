import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Play, X, ChevronUp, Tv, Search, Radio, AlertTriangle } from "lucide-react";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import { fetchLiveCategoriesFn, fetchLiveStreamsFn, getStreamUrlFn } from "@/server/iptv.functions";

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
  num: number;
  name: string;
  stream_id: number;
  stream_icon: string;
  category_id: string;
  epg_channel_id: string | null;
  tv_archive: number;
}

const PAGE_SIZE = 80;

function ChannelsPage() {
  const creds = useIptvCredentials();
  const navigate = useNavigate();

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
  const [playerMsg, setPlayerMsg] = useState("");

  // Load data
  useEffect(() => {
    if (!creds) return;
    let cancelled = false;

    async function loadData() {
      try {
        const [cats, streams] = await Promise.all([
          fetchLiveCategoriesFn({ data: creds! }),
          fetchLiveStreamsFn({ data: { ...creds! } }),
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
    return () => { cancelled = true; };
  }, [creds]);

  const handleLoadingFinished = useCallback(() => setShowContent(true), []);

  // Category map for display
  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach(c => m.set(c.category_id, c.category_name));
    return m;
  }, [categories]);

  // Filter & search
  const filtered = useMemo(() => {
    let list = channels;
    if (activeCategory !== "all") {
      list = list.filter(c => c.category_id === activeCategory);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [channels, activeCategory, searchTerm]);

  const visibleChannels = filtered.slice(0, visibleCount);
  const selected = filtered[selectedIndex] || filtered[0];

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "Escape") {
        setShowOverlay(o => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered.length]);

  // Handle watch
  const handleWatch = async (channel: IptvChannel) => {
    if (!creds) return;
    setPlayerMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
    // Still try to get stream URL for future APK use
    try {
      await getStreamUrlFn({ data: { ...creds, streamId: channel.stream_id, type: "live" } });
    } catch {
      // Expected in browser
    }
  };

  if (!creds) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0a1628" }}>
        <div className="text-center">
          <p className="text-[#6b7f99] mb-4">Sessão expirada</p>
          <button onClick={() => navigate({ to: "/" })} className="px-6 py-2 bg-[#1a5a8a] text-white rounded-lg cursor-pointer">
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
            <p className="text-[#e8edf4] text-lg mb-2">Erro</p>
            <p className="text-[#6b7f99] text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#1a5a8a] text-white rounded-lg cursor-pointer">
              Tentar Novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#000" }}>
      <TVSidebar />

      <main className="flex-1 ml-16 relative">
        {/* Player area placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-black flex items-center justify-center">
          {selected ? (
            <div className="text-center">
              {selected.stream_icon ? (
                <img src={selected.stream_icon} alt={selected.name} className="w-20 h-20 object-contain mx-auto mb-4 rounded-lg" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Radio className="w-16 h-16 text-[#2a9af0]/30 mx-auto mb-4" />
              )}
              <p className="text-white/20 text-xl font-bold">{selected.name}</p>
              <p className="text-[#2a9af0]/40 text-sm mt-1">{catMap.get(selected.category_id) || ""}</p>
            </div>
          ) : (
            <p className="text-white/10 text-xl">Selecione um canal</p>
          )}
        </div>

        {/* Player message overlay */}
        {playerMsg && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0f1e35] border border-[#1a2e48] rounded-2xl p-8 max-w-md text-center">
              <Tv className="w-12 h-12 text-[#2a9af0] mx-auto mb-4" />
              <p className="text-[#e8edf4] font-semibold mb-2">{playerMsg}</p>
              <button onClick={() => setPlayerMsg("")} className="mt-4 px-6 py-2 bg-[#1a5a8a] text-white rounded-lg cursor-pointer text-sm">
                OK
              </button>
            </div>
          </div>
        )}

        {/* Channel info top-left */}
        {selected && (
          <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
            {selected.stream_icon && (
              <img src={selected.stream_icon} alt="" className="w-10 h-7 object-contain rounded" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div>
              <p className="text-white text-sm font-bold">{selected.name}</p>
              <p className="text-white/60 text-xs">{catMap.get(selected.category_id) || ""}</p>
            </div>
            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">
              AO VIVO
            </span>
          </div>
        )}

        {/* Channel List Overlay */}
        {showOverlay && (
          <div className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col"
            style={{ background: "linear-gradient(270deg, rgba(6,10,22,0.95) 0%, rgba(6,10,22,0.8) 70%, transparent 100%)" }}
          >
            {/* Search */}
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5a70]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedIndex(0); setVisibleCount(PAGE_SIZE); }}
                  placeholder="Buscar canal..."
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1e35] border border-[#1a2e48] rounded-lg text-sm text-[#e8edf4] placeholder:text-[#4a5a70]"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 px-4 pb-2 max-h-24 overflow-y-auto">
              <button
                onClick={() => { setActiveCategory("all"); setSelectedIndex(0); setVisibleCount(PAGE_SIZE); }}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all border ${
                  activeCategory === "all"
                    ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                    : "bg-transparent text-[#6b7f99] border-[#1a2e48]/50 hover:text-white"
                }`}
              >
                Todos ({channels.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.category_id}
                  onClick={() => { setActiveCategory(cat.category_id); setSelectedIndex(0); setVisibleCount(PAGE_SIZE); }}
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

            <p className="px-4 text-[10px] text-[#4a5a70] mb-1">{filtered.length} canais</p>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100 && visibleCount < filtered.length) {
                  setVisibleCount(v => Math.min(v + PAGE_SIZE, filtered.length));
                }
              }}
            >
              {visibleChannels.map((channel, i) => (
                <button
                  key={channel.stream_id}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => handleWatch(channel)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                    i === selectedIndex
                      ? "bg-[#2a9af0]/15 border border-[#2a9af0]/30"
                      : "bg-transparent border border-transparent hover:bg-white/5"
                  }`}
                  tabIndex={0}
                >
                  <span className="text-[#4a6a8a] text-xs font-bold w-7 text-right shrink-0 tabular-nums">
                    {String(channel.num || i + 1).padStart(3, "0")}
                  </span>
                  {channel.stream_icon ? (
                    <img src={channel.stream_icon} alt="" className="w-10 h-7 object-contain rounded shrink-0" loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          const div = document.createElement('div');
                          div.className = 'w-10 h-7 rounded bg-[#1a2e48] flex items-center justify-center shrink-0';
                          div.innerHTML = '<span class="text-[7px] font-bold text-[#4a6a8a] uppercase">' + channel.name.slice(0, 3) + '</span>';
                          parent.insertBefore(div, img);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-10 h-7 rounded bg-[#1a2e48] flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold text-[#4a6a8a] uppercase">{channel.name.slice(0, 3)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                    <p className="text-[#6b7f99] text-[10px] truncate">{catMap.get(channel.category_id) || ""}</p>
                  </div>
                  {i === selectedIndex && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWatch(channel); }}
                      className="shrink-0 w-7 h-7 rounded-full bg-[#2a9af0]/20 flex items-center justify-center cursor-pointer hover:bg-[#2a9af0]/40"
                    >
                      <Play className="w-3.5 h-3.5 text-[#2a9af0] fill-[#2a9af0]" />
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
          onClick={() => setShowOverlay(o => !o)}
          className="absolute bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-all border border-white/10"
          tabIndex={0}
        >
          {showOverlay ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </main>
    </div>
  );
}
