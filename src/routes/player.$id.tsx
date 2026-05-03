import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Play, Pause, ArrowLeft, Volume2, VolumeX,
  SkipBack, SkipForward, Settings, Subtitles,
  PictureInPicture2, Maximize,
} from "lucide-react";

export const Route = createFileRoute("/player/$id")({
  head: () => ({
    meta: [{ title: "Player — Central Play Plus" }],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const { id } = Route.useParams();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [showQuality, setShowQuality] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  // Auto-hide controls after 4 seconds
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setShowControls(true);
    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault();
        setPlaying((p) => !p);
        break;
      case "ArrowLeft":
        setProgress((p) => Math.max(0, p - 5));
        break;
      case "ArrowRight":
        setProgress((p) => Math.min(100, p + 5));
        break;
      case "m":
        setMuted((m) => !m);
        break;
      case "Escape":
      case "Backspace":
        window.history.back();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Simulate progress
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.1));
    }, 1000);
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
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Fake video background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <span className="text-muted-foreground/20 text-3xl font-bold">🎬 {title}</span>
      </div>

      {/* Controls overlay */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Top gradient + back + title */}
        <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="flex items-center gap-3 text-foreground hover:text-primary cursor-pointer no-underline transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
          </a>
          <span className="text-xl lg:text-2xl font-bold text-foreground">{title}</span>
        </div>

        {/* Center play/pause */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-12 pointer-events-auto">
            <button
              onClick={() => setProgress((p) => Math.max(0, p - 5))}
              className="text-foreground/60 hover:text-foreground cursor-pointer transition-colors"
              tabIndex={0}
            >
              <SkipBack className="w-12 h-12" />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-24 h-24 rounded-full bg-foreground/15 backdrop-blur-md flex items-center justify-center hover:bg-foreground/25 cursor-pointer transition-all"
              tabIndex={0}
            >
              {playing ? <Pause className="w-12 h-12 text-foreground" /> : <Play className="w-12 h-12 text-foreground fill-current" />}
            </button>
            <button
              onClick={() => setProgress((p) => Math.min(100, p + 5))}
              className="text-foreground/60 hover:text-foreground cursor-pointer transition-colors"
              tabIndex={0}
            >
              <SkipForward className="w-12 h-12" />
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress bar */}
          <div
            className="w-full mb-5 group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div className="w-full h-1.5 group-hover:h-3 rounded-full bg-foreground/20 transition-all">
              <div className="h-full rounded-full bg-primary relative transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm lg:text-base text-foreground/70 font-mono">
                {formatTime(elapsed)} / {formatTime(total)}
              </span>
            </div>

            <div className="flex items-center gap-4 lg:gap-5">
              {/* Volume */}
              <button onClick={() => setMuted(!muted)} className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors" tabIndex={0}>
                {muted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>

              {/* Subtitles */}
              <div className="relative">
                <button onClick={() => { setShowSubtitles(!showSubtitles); setShowQuality(false); }} className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors" tabIndex={0}>
                  <Subtitles className="w-7 h-7" />
                </button>
                {showSubtitles && (
                  <div className="absolute bottom-12 right-0 bg-card rounded-xl p-4 min-w-[200px] shadow-2xl border border-border">
                    <p className="text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wider">Legendas</p>
                    {["Desligado", "Português", "English", "Español"].map(s => (
                      <button key={s} className="block w-full text-left text-base py-2 px-3 rounded-lg hover:bg-secondary text-foreground cursor-pointer transition-colors">{s}</button>
                    ))}
                    <p className="text-xs text-muted-foreground mb-3 mt-4 font-bold uppercase tracking-wider">Áudio</p>
                    {["Português (BR)", "English", "Español"].map(a => (
                      <button key={a} className="block w-full text-left text-base py-2 px-3 rounded-lg hover:bg-secondary text-foreground cursor-pointer transition-colors">{a}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality */}
              <div className="relative">
                <button onClick={() => { setShowQuality(!showQuality); setShowSubtitles(false); }} className="text-foreground/70 hover:text-foreground cursor-pointer flex items-center gap-1 transition-colors" tabIndex={0}>
                  <Settings className="w-6 h-6" />
                  <span className="text-sm font-semibold">{quality}</span>
                </button>
                {showQuality && (
                  <div className="absolute bottom-12 right-0 bg-card rounded-xl p-3 min-w-[140px] shadow-2xl border border-border">
                    {["Auto", "4K", "1080p", "720p", "480p"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setQuality(q); setShowQuality(false); }}
                        className={`block w-full text-left text-base py-2 px-3 rounded-lg cursor-pointer transition-colors ${quality === q ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
                      >{q}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors" tabIndex={0}>
                <PictureInPicture2 className="w-7 h-7" />
              </button>

              {/* Fullscreen */}
              <button className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors" tabIndex={0}>
                <Maximize className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
