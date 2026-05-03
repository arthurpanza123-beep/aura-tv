import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import logoImg from "@/assets/logo-central-play.png";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [{ title: "Quem está assistindo? — Central Play Plus" }],
  }),
  component: ProfilesPage,
});

const PROFILES = [
  { id: 1, name: "João", color: "#1a5a8a", initials: "JO", href: "/home" },
  { id: 2, name: "Maria", color: "#2a7a4a", initials: "MA", href: "/home" },
  { id: 3, name: "Pedro", color: "#8a4a2a", initials: "PE", href: "/home" },
  { id: 4, name: "Kids", color: "#7a3a8a", initials: "🧸", href: "/kids" },
];

function ProfilesPage() {
  return (
    <div
      className="tv-shell items-center justify-center relative"
      style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #111e35 70%, #0c1a2e 100%)",
      }}
    >
      <div className="flex items-center gap-3 mb-10">
        <img src={logoImg} alt="Central Play Plus" className="w-12 h-12 object-contain" />
        <span className="text-xl font-bold text-[#e8edf4]">
          Central<span className="text-[#2a7ab0]">Play</span>
        </span>
      </div>

      <h1 className="text-3xl font-bold text-[#e8edf4] mb-10">Quem está assistindo?</h1>

      <div className="flex items-center justify-center gap-10 relative z-10">
        {PROFILES.map((profile) => (
          <a
            key={profile.id}
            href={profile.href}
            className="profile-card flex flex-col items-center gap-3 outline-none cursor-pointer group no-underline"
            tabIndex={0}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white border-3 border-transparent group-hover:border-[#2a7ab0] group-focus:border-[#2a7ab0] transition-all"
              style={{ backgroundColor: profile.color }}
            >
              {profile.initials}
            </div>
            <span className="text-sm text-[#6b7f99] group-hover:text-[#e8edf4] group-focus:text-[#e8edf4] transition-colors font-medium">
              {profile.name}
            </span>
          </a>
        ))}

        <a
          href="#"
          className="profile-card flex flex-col items-center gap-3 outline-none cursor-pointer group no-underline"
          tabIndex={0}
          onClick={(e) => e.preventDefault()}
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-[#1a2e48] group-hover:border-[#2a7ab0] group-focus:border-[#2a7ab0] transition-all bg-[#0f1e35]">
            <Plus className="w-10 h-10 text-[#4a5a70] group-hover:text-[#2a7ab0] transition-colors" />
          </div>
          <span className="text-sm text-[#6b7f99] group-hover:text-[#e8edf4] transition-colors font-medium">
            Adicionar
          </span>
        </a>
      </div>
    </div>
  );
}
