import { useState, useEffect } from "react";
import logoImg from "@/assets/logo-central-play.png";

interface LoadingScreenProps {
  onFinished?: () => void;
  duration?: number;
}

export function LoadingScreen({ onFinished, duration = 1500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          onFinished?.();
          return 100;
        }
        return p + 4;
      });
    }, duration / 25);
    return () => clearInterval(interval);
  }, [duration, onFinished]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg, #060d1a 0%, #0a1628 50%, #0c1a2e 100%)" }}
    >
      {/* Logo with glow */}
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, #2a7ab0 0%, transparent 70%)",
            transform: "scale(2.5)",
          }}
        />
        <img
          src={logoImg}
          alt="Central Play Plus"
          className="relative w-20 h-20 object-contain animate-pulse"
        />
      </div>

      {/* Brand name */}
      <h1 className="text-xl font-bold text-[#e8edf4] mb-1">
        Central<span className="text-[#2a9af0]">Play</span> Plus
      </h1>
      <p className="text-xs text-[#4a6a8a] mb-6">Carregando conteúdo...</p>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full bg-[#162a42] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1a5a8a, #2a9af0)",
            boxShadow: "0 0 12px 2px rgba(42,154,240,0.4)",
          }}
        />
      </div>
    </div>
  );
}
