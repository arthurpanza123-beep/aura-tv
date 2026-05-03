import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Tv,
  Film,
  Clapperboard,
  Baby,
  Heart,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logoImg from "@/assets/logo-central-play.png";

const NAV_ITEMS = [
  { id: "home", label: "Início", href: "/home", icon: Home },
  { id: "channels", label: "Canais ao Vivo", href: "/channels", icon: Tv },
  { id: "movies", label: "Filmes", href: "/movies", icon: Film },
  { id: "series", label: "Séries", href: "/series", icon: Clapperboard },
  { id: "kids", label: "Kids", href: "/kids", icon: Baby },
  { id: "my-list", label: "Minha Lista", href: "/my-list", icon: Heart },
];

export function TVSidebar() {
  const [expanded, setExpanded] = useState(false);
  const currentPath = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <nav
      className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
        expanded ? "w-52" : "w-16"
      }`}
      style={{
        background: expanded
          ? "linear-gradient(180deg, #080e1e 0%, #0a1628 50%, #0c1a2e 100%)"
          : "linear-gradient(180deg, rgba(8,14,30,0.95) 0%, rgba(10,22,40,0.9) 100%)",
        borderRight: "1px solid rgba(26,46,72,0.5)",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 shrink-0">
        <img
          src={logoImg}
          alt="Central Play Plus"
          className={`object-contain transition-all duration-300 ${expanded ? "h-9 w-9" : "h-7 w-7"}`}
        />
        {expanded && (
          <span className="ml-2 text-sm font-bold text-[#e8edf4] whitespace-nowrap overflow-hidden">
            Central<span className="text-[#2a7ab0]">Play</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1 px-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`tv-nav-item flex items-center gap-3 rounded-xl transition-all no-underline ${
                expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
              } ${
                isActive
                  ? "bg-[#1a5a8a]/20 text-[#2a9af0]"
                  : "text-[#6b7f99] hover:text-[#e8edf4] hover:bg-[#162a42]/50"
              }`}
              tabIndex={0}
            >
              <item.icon
                className={`shrink-0 ${isActive ? "text-[#2a9af0]" : ""}`}
                style={{ width: 20, height: 20 }}
              />
              {expanded && (
                <span
                  className={`text-sm font-semibold whitespace-nowrap overflow-hidden ${isActive ? "text-[#2a9af0]" : ""}`}
                >
                  {item.label}
                </span>
              )}
              {isActive && !expanded && (
                <div className="absolute left-0 w-[3px] h-6 rounded-r-full bg-[#2a9af0]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 px-2 pb-4">
        <Link
          to="/profiles"
          className={`flex items-center gap-3 rounded-xl text-[#6b7f99] hover:text-[#e8edf4] hover:bg-[#162a42]/50 transition-all no-underline ${
            expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
          }`}
          tabIndex={0}
        >
          <User className="shrink-0" style={{ width: 20, height: 20 }} />
          {expanded && <span className="text-sm font-semibold">Perfil</span>}
        </Link>
      </div>
    </nav>
  );
}
