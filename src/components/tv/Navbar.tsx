import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import logoImg from "@/assets/logo.png";

export type TabId = "home" | "channels" | "movies" | "series" | "kids" | "my-list";

interface NavbarProps {
  onSearch?: (query: string) => void;
  activeTab?: TabId;
}

const TABS: { id: TabId; label: string; href: string }[] = [
  { id: "home", label: "Início", href: "/home" },
  { id: "channels", label: "Canais ao Vivo", href: "/channels" },
  { id: "movies", label: "Filmes", href: "/movies" },
  { id: "series", label: "Séries", href: "/series" },
  { id: "kids", label: "Kids", href: "/kids" },
  { id: "my-list", label: "Minha Lista", href: "/my-list" },
];

export function Navbar({ onSearch, activeTab = "home" }: NavbarProps) {
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
      <div className="flex items-center justify-between px-6 lg:px-12 h-16 lg:h-20">
        {/* Left: Logo */}
        <a href="/home" className="flex items-center gap-2 shrink-0 no-underline">
          <img src={logoImg} alt="Central Play Plus" className="h-9 w-9 lg:h-10 lg:w-10 object-contain" />
          <span className="text-lg lg:text-xl font-bold text-foreground hidden sm:block">
            Central<span className="text-primary">Play</span>
          </span>
        </a>

        {/* Center: Tabs */}
        <div className="hidden lg:flex items-center gap-1">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`tv-nav-item relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors no-underline ${
                activeTab === tab.id
                  ? "tv-tab-active text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              tabIndex={0}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Right: Search + Profile */}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="tv-input h-10 w-48 lg:w-64 rounded-lg bg-card/80 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="ml-2 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="tv-nav-item p-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              tabIndex={0}
            >
              <Search className="w-6 h-6" />
            </button>
          )}

          {/* Profile avatar */}
          <a
            href="/profiles"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-primary transition-all no-underline"
            style={{ backgroundColor: "oklch(0.6 0.25 255)" }}
            tabIndex={0}
          >
            JO
          </a>
        </div>
      </div>

      {/* Mobile tabs - horizontal scroll */}
      <div className="lg:hidden flex items-center gap-1 px-4 pb-2 tv-scroll overflow-x-auto">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors no-underline ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground bg-card/50"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
