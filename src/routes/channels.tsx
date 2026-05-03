import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/tv/Navbar";
import { useState } from "react";
import {
  Play,
  Plus,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Settings,
  Tv,
} from "lucide-react";

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
  currentShowDesc: string;
  timeSlot: string;
  progress: number;
  logoColors: [string, string];
  logoText: string[];
  preview: string;
  upcoming: { time: string; title: string }[];
}

const CHANNELS: Channel[] = [
  {
    id: 1,
    number: "001",
    name: "Central News",
    category: "Notícias",
    currentShow: "Jornal da Noite",
    currentShowDesc:
      "As principais notícias do Brasil e do mundo com análise, bastidores e a informação que faz a diferença.",
    timeSlot: "20:30 – 21:30",
    progress: 65,
    logoColors: ["#1a3a5c", "#2a5a8c"],
    logoText: ["CENTRAL", "NEWS"],
    preview:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop",
    upcoming: [
      { time: "21:30", title: "Central News – Em Foco" },
      { time: "22:30", title: "Mundo em Perspectiva" },
      { time: "23:30", title: "Central News – Últimas Notícias" },
    ],
  },
  {
    id: 2,
    number: "002",
    name: "Arena Sports",
    category: "Esportes",
    currentShow: "Campeonato Brasileiro: São Paulo x Bahia",
    currentShowDesc:
      "Acompanhe ao vivo mais um grande jogo do Campeonato Brasileiro com narração e análise completa.",
    timeSlot: "19:00 – 21:00",
    progress: 72,
    logoColors: ["#1a4a2a", "#2a7a3a"],
    logoText: ["ARENA", "SPORTS"],
    preview:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop",
    upcoming: [
      { time: "21:00", title: "Pós-Jogo Arena" },
      { time: "22:00", title: "Mesa Redonda Esportiva" },
      { time: "23:00", title: "Gols da Rodada" },
    ],
  },
  {
    id: 3,
    number: "003",
    name: "CineMax Brasil",
    category: "Filmes",
    currentShow: "Missão Impossível: Efeito Fallout",
    currentShowDesc:
      "Ethan Hunt e sua equipe enfrentam uma corrida contra o tempo para impedir uma catástrofe nuclear global.",
    timeSlot: "20:00 – 22:30",
    progress: 40,
    logoColors: ["#5a1a1a", "#8a2a2a"],
    logoText: ["CINEMAX", "BRASIL"],
    preview:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop",
    upcoming: [
      { time: "22:30", title: "Os Incríveis 2" },
      { time: "00:30", title: "Blade Runner 2049" },
      { time: "03:00", title: "Interestelar" },
    ],
  },
  {
    id: 4,
    number: "004",
    name: "Mundo Kids",
    category: "Infantil",
    currentShow: "Patrulha Fantástica",
    currentShowDesc:
      "As aventuras de um grupo de amigos que protegem a cidade usando seus superpoderes especiais.",
    timeSlot: "18:00 – 18:30",
    progress: 80,
    logoColors: ["#5a1a6a", "#8a3a9a"],
    logoText: ["mundo", "kids"],
    preview:
      "https://images.unsplash.com/photo-1594652634010-275456c808d0?w=800&h=450&fit=crop",
    upcoming: [
      { time: "18:30", title: "Aventuras no Espaço" },
      { time: "19:00", title: "O Mundo de Luna" },
      { time: "19:30", title: "Super Robôs" },
    ],
  },
  {
    id: 5,
    number: "005",
    name: "Vista Docs",
    category: "Notícias",
    currentShow: "Segredos da Natureza",
    currentShowDesc:
      "Uma jornada visual pelos ecossistemas mais impressionantes do planeta.",
    timeSlot: "21:00 – 22:00",
    progress: 30,
    logoColors: ["#1a4a4a", "#2a6a6a"],
    logoText: ["VISTA", "DOCS"],
    preview:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=450&fit=crop",
    upcoming: [
      { time: "22:00", title: "Planeta Oceano" },
      { time: "23:00", title: "Vida Selvagem: África" },
      { time: "00:00", title: "Cosmos: Uma Odisseia" },
    ],
  },
  {
    id: 6,
    number: "006",
    name: "Nova Música",
    category: "Abertos",
    currentShow: "Top Brasil",
    currentShowDesc:
      "Os maiores hits do momento com clipes, entrevistas exclusivas e bastidores da música brasileira.",
    timeSlot: "20:00 – 21:00",
    progress: 55,
    logoColors: ["#4a1a5a", "#6a2a8a"],
    logoText: ["NOVA", "MÚSICA"],
    preview:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop",
    upcoming: [
      { time: "21:00", title: "Acústico Especial" },
      { time: "22:00", title: "Playlist da Noite" },
      { time: "23:00", title: "Clássicos do Rock" },
    ],
  },
  {
    id: 7,
    number: "007",
    name: "Jornal 24",
    category: "Notícias",
    currentShow: "Boletim 24 Horas",
    currentShowDesc:
      "Cobertura contínua das notícias mais importantes com correspondentes em todo o Brasil.",
    timeSlot: "00:00 – 23:59",
    progress: 85,
    logoColors: ["#5a3a1a", "#8a5a2a"],
    logoText: ["JORNAL", "24"],
    preview:
      "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=450&fit=crop",
    upcoming: [
      { time: "21:00", title: "Edição da Noite" },
      { time: "22:00", title: "Entrevista Especial" },
      { time: "23:00", title: "Resumo do Dia" },
    ],
  },
  {
    id: 8,
    number: "008",
    name: "Tela Premium",
    category: "Filmes",
    currentShow: "O Poderoso Chefão",
    currentShowDesc:
      "A saga épica da família Corleone e o submundo da máfia americana nos anos 1940.",
    timeSlot: "21:00 – 00:00",
    progress: 20,
    logoColors: ["#6a5a1a", "#9a8a2a"],
    logoText: ["TELA", "PREMIUM"],
    preview:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop",
    upcoming: [
      { time: "00:00", title: "Gladiador" },
      { time: "02:30", title: "A Lista de Schindler" },
      { time: "05:00", title: "Forrest Gump" },
    ],
  },
];

const CATEGORIES = [
  "Todos",
  "Abertos",
  "Esportes",
  "Filmes",
  "Notícias",
  "Infantil",
];

function ChannelLogo({
  colors,
  text,
}: {
  colors: [string, string];
  text: string[];
}) {
  return (
    <div
      className="w-[72px] h-[52px] rounded-lg flex flex-col items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      }}
    >
      {text.map((line, i) => (
        <span
          key={i}
          className="text-[10px] font-extrabold leading-tight tracking-wide text-white/90 uppercase"
        >
          {line}
        </span>
      ))}
    </div>
  );
}

function ChannelsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered =
    activeCategory === "Todos"
      ? CHANNELS
      : CHANNELS.filter((c) => c.category === activeCategory);

  const selected = filtered[selectedIndex] || filtered[0];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #111e35 60%, #0c1a2e 100%)",
      }}
    >
      <Navbar activeTab="channels" />

      {/* Filter pills */}
      <div className="pt-20 lg:pt-24 px-6 lg:px-10">
        <div className="flex gap-2 pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border ${
                activeCategory === cat
                  ? "bg-[#1a5276] text-white border-[#2a7ab0]/50"
                  : "bg-transparent text-[#8a9bb5] border-[#1e3050] hover:text-white hover:border-[#2a5580]"
              }`}
              tabIndex={0}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main content - split layout */}
      <div className="flex-1 flex px-6 lg:px-10 gap-6 pb-16 min-h-0">
        {/* LEFT - Channel List */}
        <div className="w-[45%] flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-1 tv-scroll">
            {filtered.map((channel, i) => (
              <button
                key={channel.id}
                onClick={() => setSelectedIndex(i)}
                onFocus={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                  i === selectedIndex
                    ? "bg-[#132d4f] border border-[#2a6090]/60 shadow-lg"
                    : "bg-transparent border border-transparent hover:bg-[#0f2440]"
                }`}
                tabIndex={0}
              >
                {/* Number */}
                <span className="text-[#4a6a8a] text-base font-bold w-10 text-right shrink-0 tabular-nums">
                  {channel.number}
                </span>

                {/* Logo */}
                <ChannelLogo
                  colors={channel.logoColors}
                  text={channel.logoText}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {channel.name}
                  </p>
                  <p className="text-[#7a8fa8] text-xs truncate mt-0.5">
                    {channel.currentShow}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-[3px] bg-[#1a2a40] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2a7ab0]"
                      style={{ width: `${channel.progress}%` }}
                    />
                  </div>
                </div>

                {/* Live badge */}
                <span className="bg-[#c0392b] text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
                  AO VIVO
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT - Preview & Details */}
        <div className="w-[55%] flex flex-col min-h-0">
          {/* Preview image */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#0a1525] shrink-0">
            <img
              src={selected.preview}
              alt={selected.currentShow}
              className="w-full h-full object-cover"
            />
            {/* Overlay with channel branding */}
            <div className="absolute bottom-4 left-4">
              <ChannelLogo
                colors={selected.logoColors}
                text={selected.logoText}
              />
            </div>
          </div>

          {/* Details */}
          <div className="mt-5 flex-1 overflow-y-auto tv-scroll">
            <p className="text-[#3a8fd4] text-sm font-semibold">
              {selected.name}
            </p>
            <h2 className="text-white text-2xl font-bold mt-1">
              {selected.currentShow}
            </h2>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-[#8a9bb5] text-sm">
                {selected.timeSlot}
              </span>
              <span className="bg-[#c0392b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                AO VIVO
              </span>
            </div>

            <p className="text-[#8a9bb5] text-sm leading-relaxed mt-3 max-w-lg">
              {selected.currentShowDesc}
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 mt-5">
              <a
                href={`/player/${selected.id}`}
                className="tv-btn flex items-center gap-2 px-7 py-3 rounded-lg bg-[#1a5a8a] hover:bg-[#1e6a9e] text-white text-sm font-bold transition-colors no-underline cursor-pointer"
                tabIndex={0}
              >
                <Play className="w-4 h-4 fill-white" />
                Assistir agora
              </a>
              <button
                className="tv-btn flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent border border-[#2a4a6a] hover:bg-[#0f2440] text-[#8a9bb5] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                tabIndex={0}
              >
                <Plus className="w-4 h-4" />
                Adicionar à lista
              </button>
            </div>

            {/* Upcoming */}
            <div className="mt-6">
              <p className="text-[#6a7a90] text-xs font-semibold uppercase tracking-wider mb-3">
                Próximas programações
              </p>
              <div className="space-y-2">
                {selected.upcoming.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[#3a8fd4] text-sm font-semibold w-12 shrink-0">
                      {item.time}
                    </span>
                    <span className="text-[#8a9bb5] text-sm">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom remote bar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 flex items-center justify-between px-10 border-t border-[#1a2a40]"
        style={{ background: "linear-gradient(to top, #080f1e, #0a1628)" }}
      >
        <div className="flex items-center gap-2 text-[#5a6a80] text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </div>
        <div className="flex items-center gap-2 text-[#5a6a80] text-xs">
          <Search className="w-4 h-4" />
          <span>Pesquisar</span>
        </div>
        <div className="flex items-center gap-2 text-[#5a6a80] text-xs">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtro</span>
        </div>
        <div className="flex items-center gap-2 text-[#5a6a80] text-xs">
          <Settings className="w-4 h-4" />
          <span>Opções</span>
        </div>
        <div className="flex items-center gap-2 text-[#8a9bb5] text-xs font-semibold">
          <span className="w-6 h-6 rounded-full bg-[#1a3a5c] border border-[#2a5a8a] flex items-center justify-center text-[10px] text-white font-bold">
            OK
          </span>
          <span>Assistir</span>
        </div>
      </div>
    </div>
  );
}
