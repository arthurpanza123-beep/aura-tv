import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";

export type TabId = "home" | "channels" | "movies" | "series" | "kids" | "my-list";

interface NavbarProps {
  onSearch?: (query: string) => void;
  activeTab?: TabId;
}

const TABS: { id: TabId; label: string; to: string }[] = [
  { id: "home", label: "Início", to: "/home" },
  { id: "channels", label: "Canais ao Vivo", to: "/channels" },
  { id: "movies", label: "Filmes", to: "/movies" },
  { id: "series", label: "Séries", to: "/series" },
  { id: "kids", label: "Kids", to: "/kids" },
  { id: "my-list", label: "Minha Lista", to: "/my-list" },
];

export function Navbar({ onSearch, activeTab = "home" }: NavbarProps) {
  const navigate = useNavigate();
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/30"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 lg:px-10 h-14 lg:h-16">
        {/* Left: Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img src={logoImg} alt="Central Play Plus" className="h-8 w-8 lg:h-9 lg:w-9 object-contain" />
          <span className="text-base lg:text-lg font-bold text-foreground hidden sm:block">
            Central<span className="text-primary">Play</span>
          </span>
        </Link>

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              to={tab.to as "/home"}
              className={`tv-nav-item relative px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "tv-tab-active text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              tabIndex={0}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Right: Search + Profile */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="tv-input h-8 w-40 lg:w-56 rounded-lg bg-card/80 border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="ml-1 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="tv-nav-item p-2 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              tabIndex={0}
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Profile avatar */}
          <button
            onClick={() => navigate({ to: "/profiles" })}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            style={{ backgroundColor: "oklch(0.6 0.25 255)" }}
            tabIndex={0}
          >
            JO
          </button>
        </div>
      </div>

      {/* Mobile tabs - horizontal scroll */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 tv-scroll overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={tab.to as "/home"}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground bg-card/50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
