import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Tv, Film, Clapperboard, Settings, Search, User, X } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const NAV_LINKS = [
  { label: "Início", icon: Home, to: "/home" },
  { label: "Filmes", icon: Film, to: "/home" },
  { label: "Séries", icon: Clapperboard, to: "/home" },
  { label: "Canais ao Vivo", icon: Tv, to: "/home" },
];

export function Navbar({ onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-8">
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img src={logoImg} alt="Central Play Plus" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-foreground hidden lg:block">
            Central<span className="text-primary">Play</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="tv-nav-item flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={0}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Search + Profile */}
      <div className="flex items-center gap-3">
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes, séries..."
              className="tv-input h-9 w-56 rounded-lg bg-card/80 border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="ml-2 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="tv-nav-item p-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            tabIndex={0}
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <button
          className="tv-nav-item p-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          tabIndex={0}
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
          tabIndex={0}
        >
          <User className="w-4 h-4 text-primary" />
        </button>
      </div>
    </nav>
  );
}
