import { createFileRoute } from "@tanstack/react-router";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { LoadingScreen } from "@/components/tv/LoadingScreen";
import { useState, useCallback, useEffect } from "react";
import { Play, ChevronUp, ChevronDown, X, Tv } from "lucide-react";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [{ title: "Canais ao Vivo — Central Play Plus" }],
  }),
  component: ChannelsPage,
});

interface Channel {
  id: number;
  number: string;
  name: string;
  category: string;
  currentShow: string;
  timeSlot: string;
  progress: number;
  logoColors: [string, string];
  logoText: string[];
  preview: string;
}

const CHANNELS: Channel[] = [
  { id: 1, number: "001", name: "Central News", category: "Notícias", currentShow: "Jornal da Noite", timeSlot: "20:30 – 21:30", progress: 65, logoColors: ["#1a3a5c", "#2a5a8c"], logoText: ["CENTRAL", "NEWS"], preview: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=675&fit=crop" },
  { id: 2, number: "002", name: "Arena Sports", category: "Esportes", currentShow: "Brasileiro: São Paulo x Bahia", timeSlot: "19:00 – 21:00", progress: 72, logoColors: ["#1a4a2a", "#2a7a3a"], logoText: ["ARENA", "SPORTS"], preview: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop" },
  { id: 3, number: "003", name: "CineMax Brasil", category: "Filmes", currentShow: "Missão Impossível: Fallout", timeSlot: "20:00 – 22:30", progress: 40, logoColors: ["#5a1a1a", "#8a2a2a"], logoText: ["CINEMAX", "BRASIL"], preview: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=675&fit=crop" },
  { id: 4, number: "004", name: "Mundo Kids", category: "Infantil", currentShow: "Patrulha Fantástica", timeSlot: "18:00 – 18:30", progress: 80, logoColors: ["#5a1a6a", "#8a3a9a"], logoText: ["MUNDO", "KIDS"], preview: "https://images.unsplash.com/photo-1594652634010-275456c808d0?w=1200&h=675&fit=crop" },
  { id: 5, number: "005", name: "Vista Docs", category: "Documentários", currentShow: "Segredos da Natureza", timeSlot: "21:00 – 22:00", progress: 30, logoColors: ["#1a4a4a", "#2a6a6a"], logoText: ["VISTA", "DOCS"], preview: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&h=675&fit=crop" },
  { id: 6, number: "006", name: "Nova Música", category: "Entretenimento", currentShow: "Top Brasil", timeSlot: "20:00 – 21:00", progress: 55, logoColors: ["#4a1a5a", "#6a2a8a"], logoText: ["NOVA", "MÚSICA"], preview: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop" },
  { id: 7, number: "007", name: "Jornal 24", category: "Notícias", currentShow: "Boletim 24 Horas", timeSlot: "24h", progress: 85, logoColors: ["#5a3a1a", "#8a5a2a"], logoText: ["JORNAL", "24"], preview: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&h=675&fit=crop" },
  { id: 8, number: "008", name: "Tela Premium", category: "Filmes", currentShow: "O Poderoso Chefão", timeSlot: "21:00 – 00:00", progress: 20, logoColors: ["#6a5a1a", "#9a8a2a"], logoText: ["TELA", "PREMIUM"], preview: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop" },
];

const CATEGORIES = ["Todos", "Esportes", "Filmes", "Notícias", "Infantil", "Documentários", "Entretenimento"];

function ChannelsPage() {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const handleLoadingFinished = useCallback(() => {
    setShowContent(true);
    setLoading(false);
  }, []);

  const filtered = activeCategory === "Todos"
    ? CHANNELS
    : CHANNELS.filter(c => c.category === activeCategory);

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

  if (!showContent) {
    return <LoadingScreen onFinished={handleLoadingFinished} duration={800} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#000" }}>
      <TVSidebar />

      {/* Fullscreen Player Background */}
      <main className="flex-1 ml-16 relative">
        <img
          src={selected.preview}
          alt={selected.currentShow}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Channel info top-left */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
          <div
            className="w-12 h-9 rounded-lg flex flex-col items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${selected.logoColors[0]}, ${selected.logoColors[1]})` }}
          >
            {selected.logoText.map((line, i) => (
              <span key={i} className="text-[7px] font-extrabold leading-tight tracking-wide text-white/90 uppercase">{line}</span>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{selected.name}</p>
            <p className="text-white/60 text-xs">{selected.currentShow} · {selected.timeSlot}</p>
          </div>
          <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">
            AO VIVO
          </span>
        </div>

        {/* Progress bar at bottom of video */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <div className="h-full bg-[#2a9af0]" style={{ width: `${selected.progress}%` }} />
        </div>

        {/* Channel List Overlay */}
        {showOverlay && (
          <div className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col"
            style={{ background: "linear-gradient(270deg, rgba(6,10,22,0.95) 0%, rgba(6,10,22,0.8) 70%, transparent 100%)" }}
          >
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 px-4 pt-4 pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSelectedIndex(0); }}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all border ${
                    activeCategory === cat
                      ? "bg-[#2a9af0]/20 text-[#2a9af0] border-[#2a9af0]/40"
                      : "bg-transparent text-[#6b7f99] border-[#1a2e48]/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {filtered.map((channel, i) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                    i === selectedIndex
                      ? "bg-[#2a9af0]/15 border border-[#2a9af0]/30"
                      : "bg-transparent border border-transparent hover:bg-white/5"
                  }`}
                  tabIndex={0}
                >
                  <span className="text-[#4a6a8a] text-xs font-bold w-7 text-right shrink-0 tabular-nums">
                    {channel.number}
                  </span>
                  <div
                    className="w-10 h-7 rounded flex flex-col items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${channel.logoColors[0]}, ${channel.logoColors[1]})` }}
                  >
                    {channel.logoText.map((line, li) => (
                      <span key={li} className="text-[5px] font-extrabold leading-tight text-white/90 uppercase">{line}</span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                    <p className="text-[#6b7f99] text-[10px] truncate">{channel.currentShow}</p>
                  </div>
                  {i === selectedIndex && (
                    <Tv className="w-3.5 h-3.5 text-[#2a9af0] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle overlay button */}
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
