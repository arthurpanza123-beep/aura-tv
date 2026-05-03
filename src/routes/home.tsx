import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Central Play Plus — Início" },
      { name: "description", content: "Assista canais ao vivo, filmes e séries no Central Play Plus." },
    ],
  }),
  component: HomePage,
});

const NAV_ITEMS = [
  { label: "Início", icon: "🏠" },
  { label: "Canais", icon: "📺" },
  { label: "Filmes", icon: "🎬" },
  { label: "Séries", icon: "📽️" },
  { label: "Configurações", icon: "⚙️" },
];

const HERO = {
  title: "Expresso do Amanhã",
  subtitle: "Temporada 4 — Disponível Agora",
  description: "Em um mundo congelado, os últimos sobreviventes lutam por espaço e poder a bordo de um trem que nunca para.",
  gradient: "from-primary/40 via-background/80 to-background",
};

interface ContentItem {
  id: number;
  title: string;
  image: string;
}

const CHANNELS: ContentItem[] = [
  { id: 1, title: "Globo", image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=170&fit=crop" },
  { id: 2, title: "SBT", image: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=300&h=170&fit=crop" },
  { id: 3, title: "Record TV", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=170&fit=crop" },
  { id: 4, title: "Band", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=170&fit=crop" },
  { id: 5, title: "ESPN Brasil", image: "https://images.unsplash.com/photo-1461896836934-bd45ba688837?w=300&h=170&fit=crop" },
  { id: 6, title: "SporTV", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=170&fit=crop" },
  { id: 7, title: "Multishow", image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=170&fit=crop" },
  { id: 8, title: "GNT", image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&h=170&fit=crop" },
];

const MOVIES: ContentItem[] = [
  { id: 1, title: "Cidade de Deus", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop" },
  { id: 2, title: "Tropa de Elite", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop" },
  { id: 3, title: "O Auto da Compadecida", image: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a3aaf?w=300&h=450&fit=crop" },
  { id: 4, title: "Central do Brasil", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop" },
  { id: 5, title: "Bacurau", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=450&fit=crop" },
  { id: 6, title: "Aquarius", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop" },
  { id: 7, title: "Que Horas Ela Volta?", image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=300&h=450&fit=crop" },
  { id: 8, title: "O Pagador de Promessas", image: "https://images.unsplash.com/photo-1542204625-ca960ca44370?w=300&h=450&fit=crop" },
];

const SERIES: ContentItem[] = [
  { id: 1, title: "3%", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop" },
  { id: 2, title: "Sintonia", image: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=300&h=450&fit=crop" },
  { id: 3, title: "Cidade Invisível", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=450&fit=crop" },
  { id: 4, title: "Bem-vinda a Quixeramobim", image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&h=450&fit=crop" },
  { id: 5, title: "O Mecanismo", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop" },
  { id: 6, title: "Irmandade", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&h=450&fit=crop" },
  { id: 7, title: "Bom Dia, Verônica", image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=450&fit=crop" },
  { id: 8, title: "Vai na Fé", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop" },
];

function ContentRow({ title, items, isWide }: { title: string; items: ContentItem[]; isWide?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4 px-8">{title}</h2>
      <div
        ref={scrollRef}
        className="tv-scroll flex gap-4 overflow-x-auto px-8 pb-4"
      >
        {items.map((item) => (
          <button
            key={item.id}
            className={`tv-card flex-shrink-0 overflow-hidden bg-card cursor-pointer ${
              isWide ? "w-52 h-32" : "w-36 h-52"
            }`}
            tabIndex={0}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <span className="text-xs font-semibold text-foreground truncate block">
                {item.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="flex items-center gap-1 px-8 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
        <img src={logoImg} alt="Central Play Plus" className="w-10 h-10 object-contain mr-4" />
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.label}
            tabIndex={0}
            onClick={() => setActiveNav(i)}
            className={`tv-nav-item px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
              activeNav === i
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Hero Banner */}
      <div className="relative w-full h-[45vh] min-h-[300px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop"
          alt={HERO.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-10">
          <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
            EM DESTAQUE
          </span>
          <h1 className="text-4xl font-black text-foreground mb-2 leading-tight">
            {HERO.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-1">{HERO.subtitle}</p>
          <p className="text-sm text-muted-foreground max-w-xl mb-5 line-clamp-2">
            {HERO.description}
          </p>
          <div className="flex gap-3">
            <button
              tabIndex={0}
              className="tv-btn h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-base cursor-pointer hover:bg-primary/90"
            >
              ▶ Assistir
            </button>
            <button
              tabIndex={0}
              className="tv-btn h-12 px-8 rounded-xl bg-secondary text-secondary-foreground font-bold text-base cursor-pointer hover:bg-secondary/80"
            >
              + Minha Lista
            </button>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="pt-6">
        <ContentRow title="📺 Canais ao Vivo" items={CHANNELS} isWide />
        <ContentRow title="🎬 Filmes" items={MOVIES} />
        <ContentRow title="📽️ Séries" items={SERIES} />
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-xs text-muted-foreground border-t border-border/30">
        © 2026 Central Play Plus — Todos os direitos reservados
      </footer>
    </div>
  );
}
