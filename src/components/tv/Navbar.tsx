import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import logoImg from "@/assets/logo-central-play.png";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#080f1e]/90 to-transparent">
      <div className="flex items-center justify-between px-10 h-14">
        {/* Logo */}
        <a href="/home" className="flex items-center gap-2 shrink-0 no-underline">
          <img src={logoImg} alt="Central Play Plus" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-[#e8edf4] hidden sm:block">
            Central<span className="text-[#2a7ab0]">Play</span>
          </span>
        </a>

        {/* Tabs */}
        <div className="hidden lg:flex items-center gap-1">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`tv-nav-item relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
                activeTab === tab.id
                  ? "tv-tab-active text-[#2a7ab0]"
                  : "text-[#6b7f99] hover:text-[#e8edf4]"
              }`}
              tabIndex={0}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Search + Profile */}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="tv-input h-9 w-48 rounded-lg bg-[#0f1e35]/80 border border-[#1a2e48] px-4 text-sm text-[#e8edf4] placeholder:text-[#4a5a70]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="ml-2 p-1.5 text-[#6b7f99] hover:text-[#e8edf4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="tv-nav-item p-2 rounded-lg text-[#6b7f99] hover:text-[#e8edf4] cursor-pointer"
              tabIndex={0}
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <a
            href="/profiles"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-[#2a7ab0] transition-all no-underline"
            style={{ backgroundColor: "#1a5a8a" }}
            tabIndex={0}
          >
            JO
          </a>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            href={tab.href}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors no-underline ${
              activeTab === tab.id
                ? "bg-[#1a5a8a] text-white"
                : "text-[#6b7f99] bg-[#0f1e35]/50"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
