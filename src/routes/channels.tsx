import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/tv/Navbar";
import { Radio, Tv } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "Canais ao Vivo — Central Play Plus" },
    ],
  }),
  component: ChannelsPage,
});

interface Channel {
  id: number;
  name: string;
  logo: string;
  category: string;
  currentShow: string;
}

const CHANNELS: Channel[] = [
  { id: 1, name: "Globo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Rede_Globo_logo.svg/200px-Rede_Globo_logo.svg.png", category: "Abertos", currentShow: "Jornal Nacional" },
  { id: 2, name: "SBT", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/SBT_logo.svg/200px-SBT_logo.svg.png", category: "Abertos", currentShow: "Programa Silvio Santos" },
  { id: 3, name: "Record TV", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/RecordTV_logo.svg/200px-RecordTV_logo.svg.png", category: "Abertos", currentShow: "Domingo Espetacular" },
  { id: 4, name: "Band", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rede_Bandeirantes_logo_2019.svg/200px-Rede_Bandeirantes_logo_2019.svg.png", category: "Abertos", currentShow: "Brasil Urgente" },
  { id: 5, name: "RedeTV!", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/RedeTV%21_logo.svg/200px-RedeTV%21_logo.svg.png", category: "Abertos", currentShow: "Sensacional" },
  { id: 6, name: "ESPN", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ESPN_logo.svg/200px-ESPN_logo.svg.png", category: "Esportes", currentShow: "SportsCenter" },
  { id: 7, name: "SporTV", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/SporTV_2021.svg/200px-SporTV_2021.svg.png", category: "Esportes", currentShow: "Troca de Passes" },
  { id: 8, name: "Fox Sports", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fox_Sports_Logo.svg/200px-Fox_Sports_Logo.svg.png", category: "Esportes", currentShow: "Futebol ao Vivo" },
  { id: 9, name: "GloboNews", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/GloboNews_2020.svg/200px-GloboNews_2020.svg.png", category: "Notícias", currentShow: "Jornal das Dez" },
  { id: 10, name: "CNN Brasil", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CNN_Brasil.svg/200px-CNN_Brasil.svg.png", category: "Notícias", currentShow: "CNN Tonight" },
  { id: 11, name: "BandNews", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/BandNews_TV_2020.svg/200px-BandNews_TV_2020.svg.png", category: "Notícias", currentShow: "Jornal BandNews" },
  { id: 12, name: "Multishow", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Multishow_2020.svg/200px-Multishow_2020.svg.png", category: "Entretenimento", currentShow: "TVZ" },
  { id: 13, name: "Telecine", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Telecine_2020.svg/200px-Telecine_2020.svg.png", category: "Filmes", currentShow: "Filme em Exibição" },
  { id: 14, name: "HBO", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/200px-HBO_logo.svg.png", category: "Filmes", currentShow: "Sessão HBO" },
  { id: 15, name: "Discovery", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Discovery_Channel_2019.svg/200px-Discovery_Channel_2019.svg.png", category: "Documentários", currentShow: "Investigação Discovery" },
  { id: 16, name: "Cartoon Network", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/200px-Cartoon_Network_2010_logo.svg.png", category: "Infantil", currentShow: "Hora de Aventura" },
];

const CATEGORIES = ["Todos", "Abertos", "Esportes", "Notícias", "Entretenimento", "Filmes", "Documentários", "Infantil"];

function ChannelsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const filtered = activeCategory === "Todos" ? CHANNELS : CHANNELS.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab="channels" />
      
      <div className="pt-24 px-6 lg:px-12">
        <div className="flex items-center gap-3 mb-6">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          <h1 className="text-3xl lg:text-4xl font-black text-foreground">Canais ao Vivo</h1>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 tv-scroll overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Channels list with preview */}
        <div className="grid gap-3">
          {filtered.map((channel) => (
            <button
              key={channel.id}
              className="tv-focusable flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-tv-surface-hover transition-all cursor-pointer text-left w-full"
              tabIndex={0}
            >
              {/* Logo */}
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-white/10 flex items-center justify-center p-2 shrink-0">
                {!imgErrors.has(channel.id) ? (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-full object-contain"
                    onError={() => setImgErrors(prev => new Set(prev).add(channel.id))}
                  />
                ) : (
                  <Tv className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-foreground truncate">{channel.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{channel.currentShow}</p>
                <span className="text-xs text-primary font-medium">{channel.category}</span>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-400 font-semibold uppercase">AO VIVO</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
