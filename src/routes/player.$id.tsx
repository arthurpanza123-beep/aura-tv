import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Play, Pause, ArrowLeft, Volume2, VolumeX,
  SkipBack, SkipForward, Settings, Subtitles,
  Maximize, ChevronDown, ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/player/$id")({
  head: () => ({
    meta: [{ title: "Player — Central Play Plus" }],
  }),
  component: PlayerPage,
});

const EPISODES = [
  { id: 1, title: "Episódio 1 — Piloto", duration: "52min", thumb: "https://image.tmdb.org/t/p/w300/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg" },
  { id: 2, title: "Episódio 2 — A Revelação", duration: "48min", thumb: "https://image.tmdb.org/t/p/w300/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg" },
  { id: 3, title: "Episódio 3 — Consequências", duration: "55min", thumb: "https://image.tmdb.org/t/p/w300/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg" },
  { id: 4, title: "Episódio 4 — O Confronto", duration: "50min", thumb: "https://image.tmdb.org/t/p/w300/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg" },
  { id: 5, title: "Episódio 5 — Aliança", duration: "47min", thumb: "https://image.tmdb.org/t/p/w300/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg" },
  { id: 6, title: "Episódio 6 — Final", duration: "62min", thumb: "https://image.tmdb.org/t/p/w300/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg" },
];

function PlayerPage() {
  const { id } = Route.useParams();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [showQuality, setShowQuality] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [currentEp, setCurrentEp] = useState(0);

  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setShowControls(true);
    switch (e.key) {
      case " ": case "Enter": e.preventDefault(); setPlaying(p => !p); break;
      case "ArrowLeft": setProgress(p => Math.max(0, p - 5)); break;
      case "ArrowRight": setProgress(p => Math.min(100, p + 5)); break;
      case "m": setMuted(m => !m); break;
      case "Escape": case "Backspace": window.history.back(); break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.1), 1000);
    return () => clearInterval(interval);
  }, [playing]);

  const title = "Conteúdo #" + id;
  const elapsed = Math.floor((progress / 100) * 139 * 60);
  const total = 139 * 60;
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
      {/* Video area */}
      <div
        className={`relative transition-all duration-300 ${showEpisodes ? "h-[65vh]" : "h-full"}`}
        onMouseMove={() => setShowControls(true)}
        onClick={() => setShowControls(true)}
      >
        {/* Fake video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <span className="text-white/10 text-3xl font-bold">🎬 {title}</span>
        </div>

        {/* Controls overlay */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {/* Top */}
          <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
            <a href="#" onClick={e => { e.preventDefault(); window.history.back(); }} className="text-white hover:text-[#2a9af0] no-underline cursor-pointer">
              <ArrowLeft className="w-7 h-7" />
            </a>
            <div>
              <span className="text-lg font-bold text-white">{title}</span>
              <span className="text-white/50 text-sm ml-3">{EPISODES[currentEp]?.title}</span>
            </div>
          </div>

          {/* Center play */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-10 pointer-events-auto">
              <button onClick={() => setProgress(p => Math.max(0, p - 5))} className="text-white/50 hover:text-white cursor-pointer"><SkipBack className="w-10 h-10" /></button>
              <button onClick={() => setPlaying(!playing)} className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer">
                {playing ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white fill-current" />}
              </button>
              <button onClick={() => setProgress(p => Math.min(100, p + 5))} className="text-white/50 hover:text-white cursor-pointer"><SkipForward className="w-10 h-10" /></button>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
            <div className="w-full mb-4 group cursor-pointer" onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - rect.left) / rect.width) * 100);
            }}>
              <div className="w-full h-1 group-hover:h-2.5 rounded-full bg-white/20 transition-all">
                <div className="h-full rounded-full bg-[#2a9af0] relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2a9af0] shadow-lg shadow-[#2a9af0]/50 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-mono">{formatTime(elapsed)} / {formatTime(total)}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setMuted(!muted)} className="text-white/60 hover:text-white cursor-pointer">
                  {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div className="relative">
                  <button onClick={() => { setShowSubtitles(!showSubtitles); setShowQuality(false); }} className="text-white/60 hover:text-white cursor-pointer">
                    <Subtitles className="w-6 h-6" />
                  </button>
                  {showSubtitles && (
                    <div className="absolute bottom-10 right-0 bg-[#0f1e35] rounded-xl p-3 min-w-[180px] shadow-2xl border border-[#1a2e48]">
                      <p className="text-[10px] text-[#6b7f99] mb-2 font-bold uppercase">Legendas</p>
                      {["Desligado", "Português", "English", "Español"].map(s => (
                        <button key={s} className="block w-full text-left text-sm py-1.5 px-2 rounded-lg hover:bg-[#162a42] text-white cursor-pointer">{s}</button>
                      ))}
                      <p className="text-[10px] text-[#6b7f99] mb-2 mt-3 font-bold uppercase">Áudio</p>
                      {["Português (BR)", "English"].map(a => (
                        <button key={a} className="block w-full text-left text-sm py-1.5 px-2 rounded-lg hover:bg-[#162a42] text-white cursor-pointer">{a}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onClick={() => { setShowQuality(!showQuality); setShowSubtitles(false); }} className="text-white/60 hover:text-white cursor-pointer flex items-center gap-1">
                    <Settings className="w-5 h-5" />
                    <span className="text-xs font-semibold">{quality}</span>
                  </button>
                  {showQuality && (
                    <div className="absolute bottom-10 right-0 bg-[#0f1e35] rounded-xl p-2 min-w-[120px] shadow-2xl border border-[#1a2e48]">
                      {["Auto", "4K", "1080p", "720p", "480p"].map(q => (
                        <button key={q} onClick={() => { setQuality(q); setShowQuality(false); }} className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg cursor-pointer ${quality === q ? "text-[#2a9af0] bg-[#2a9af0]/10" : "text-white hover:bg-[#162a42]"}`}>{q}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowEpisodes(e => !e)} className="text-white/60 hover:text-white cursor-pointer">
                  {showEpisodes ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                </button>
                <button className="text-white/60 hover:text-white cursor-pointer"><Maximize className="w-6 h-6" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes panel below */}
      {showEpisodes && (
        <div className="flex-1 bg-[#080e1e] overflow-y-auto px-6 py-4 border-t border-[#1a2e48]/50">
          <h3 className="text-sm font-bold text-[#e8edf4] mb-3">Temporada 1 · Episódios</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {EPISODES.map((ep, i) => (
              <button
                key={ep.id}
                onClick={() => setCurrentEp(i)}
                className={`flex-shrink-0 w-56 rounded-xl overflow-hidden cursor-pointer transition-all border ${
                  i === currentEp
                    ? "border-[#2a9af0] shadow-lg shadow-[#2a9af0]/20"
                    : "border-transparent hover:border-[#1a2e48]"
                }`}
              >
                <div className="relative aspect-video bg-[#0f1e35]">
                  <img src={ep.thumb} alt={ep.title} className="w-full h-full object-cover" />
                  {i === currentEp && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="p-2 bg-[#0c1520]">
                  <p className={`text-xs font-semibold truncate ${i === currentEp ? "text-[#2a9af0]" : "text-white"}`}>{ep.title}</p>
                  <p className="text-[10px] text-[#6b7f99]">{ep.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
