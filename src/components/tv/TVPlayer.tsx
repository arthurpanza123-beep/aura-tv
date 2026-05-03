import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, AlertTriangle, Loader2, Tv } from "lucide-react";
import Hls from "hls.js";

interface TVPlayerProps {
  streamUrl: string;
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function TVPlayer({ streamUrl, title, subtitle, onBack }: TVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "paused" | "error" | "unsupported">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  // Attempt playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    const url = streamUrl;
    const isHls = url.includes(".m3u8") || url.includes("m3u8");
    const isTs = url.endsWith(".ts");

    // Check mixed content
    if (url.startsWith("http://") && window.location.protocol === "https:") {
      setStatus("unsupported");
      setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
      return;
    }

    let destroyed = false;

    async function tryPlay() {
      try {
        if (isHls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: (xhr) => {
              xhr.timeout = 10000;
            },
          });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video!);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!destroyed) {
              video!.play().catch(() => {
                if (!destroyed) { setStatus("unsupported"); setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK."); }
              });
            }
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal && !destroyed) {
              setStatus("unsupported");
              setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
              hls.destroy();
            }
          });
        } else if (isHls && video!.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS (Safari)
          video!.src = url;
          await video!.play();
        } else if (isTs) {
          // .ts streams usually don't work in browser
          setStatus("unsupported");
          setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
          return;
        } else {
          // MP4, MKV, etc.
          video!.src = url;
          try {
            await video!.play();
          } catch {
            if (!destroyed) {
              setStatus("unsupported");
              setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
            }
            return;
          }
        }
      } catch {
        if (!destroyed) {
          setStatus("unsupported");
          setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
        }
      }
    }

    tryPlay();

    return () => {
      destroyed = true;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [streamUrl]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => setStatus("playing");
    const onPause = () => setStatus("paused");
    const onError = () => {
      setStatus("unsupported");
      setErrorMsg("Preview indisponível no navegador. O teste completo será feito no APK.");
    };
    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setDuration(video.duration);
      }
    };
    const onWaiting = () => setStatus("loading");

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("waiting", onWaiting);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("waiting", onWaiting);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      resetControlsTimer();
      const video = videoRef.current;
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          if (video) video.paused ? video.play() : video.pause();
          break;
        case "ArrowLeft":
          if (video) video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          if (video && video.duration) video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "m":
          setMuted(m => { if (video) video.muted = !m; return !m; });
          break;
        case "Escape":
        case "Backspace":
          onBack();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onBack, resetControlsTimer]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) video.paused ? video.play() : video.pause();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black select-none flex items-center justify-center"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Video element (hidden when unsupported) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-contain bg-black ${status === "unsupported" ? "hidden" : ""}`}
        playsInline
        autoPlay
        muted={muted}
      />

      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <Loader2 className="w-16 h-16 text-[#2a9af0] animate-spin mb-4" />
          <p className="text-white/80 text-lg font-medium">Carregando...</p>
          <p className="text-white/40 text-sm mt-1">{title}</p>
        </div>
      )}

      {/* Unsupported / Error state */}
      {status === "unsupported" && (
        <div className="absolute inset-0 flex items-center justify-center z-20"
          style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0c1a2e 100%)" }}
        >
          <div className="text-center max-w-lg px-8">
            <Tv className="w-20 h-20 text-[#2a9af0]/60 mx-auto mb-6" />
            <h2 className="text-white text-xl font-bold mb-3">{title}</h2>
            {subtitle && <p className="text-[#6b7f99] text-sm mb-4">{subtitle}</p>}
            <div className="bg-[#0f1e35] border border-[#1a2e48] rounded-2xl p-6 mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500/80 mx-auto mb-3" />
              <p className="text-[#e8edf4] text-sm font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-[#1a5a8a] hover:bg-[#1e6a9e] text-white rounded-xl font-semibold cursor-pointer transition-all text-base"
              autoFocus
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Controls overlay (only when playing/paused) */}
      {(status === "playing" || status === "paused") && (
        <div className={`absolute inset-0 z-30 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
            <button onClick={onBack} className="text-white hover:text-[#2a9af0] cursor-pointer transition-colors">
              <ArrowLeft className="w-8 h-8" />
            </button>
            <div>
              <p className="text-white text-lg font-bold">{title}</p>
              {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
            </div>
          </div>

          {/* Center play/pause */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer pointer-events-auto transition-all"
            >
              {status === "paused" ? (
                <Play className="w-10 h-10 text-white fill-white" />
              ) : (
                <Pause className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {/* Progress bar */}
            {duration > 0 && (
              <div
                className="w-full mb-4 group cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  const video = videoRef.current;
                  if (video && video.duration) video.currentTime = (pct / 100) * video.duration;
                }}
              >
                <div className="w-full h-1 group-hover:h-2.5 rounded-full bg-white/20 transition-all">
                  <div className="h-full rounded-full bg-[#2a9af0] relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2a9af0] shadow-lg shadow-[#2a9af0]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {duration > 0 ? (
                <span className="text-sm text-white/60 font-mono tabular-nums">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              ) : (
                <span className="text-sm text-red-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  AO VIVO
                </span>
              )}
              <div className="flex items-center gap-4">
                <button onClick={() => setMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m; })} className="text-white/60 hover:text-white cursor-pointer">
                  {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
