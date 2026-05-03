import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Quem está assistindo? — Central Play Plus" },
    ],
  }),
  component: ProfilesPage,
});

const PROFILES = [
  { id: 1, name: "João", color: "oklch(0.6 0.25 255)", initials: "JO", href: "/home" },
  { id: 2, name: "Maria", color: "oklch(0.65 0.2 150)", initials: "MA", href: "/home" },
  { id: 3, name: "Pedro", color: "oklch(0.6 0.22 30)", initials: "PE", href: "/home" },
  { id: 4, name: "Kids", color: "oklch(0.7 0.2 330)", initials: "🧸", href: "/kids" },
];

function ProfilesPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: "var(--tv-glow)" }} />

      <div className="flex items-center gap-3 mb-12">
        <img src={logoImg} alt="Central Play Plus" className="w-12 h-12 object-contain" />
        <span className="text-2xl font-bold text-foreground">
          Central<span className="text-primary">Play</span>
        </span>
      </div>

      <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-10">
        Quem está assistindo?
      </h1>

      <div className="flex items-center justify-center gap-6 lg:gap-10 flex-wrap">
        {PROFILES.map((profile) => (
          <a
            key={profile.id}
            href={profile.href}
            className="profile-card flex flex-col items-center gap-3 outline-none cursor-pointer group no-underline"
            tabIndex={0}
          >
            <div
              className="w-20 h-20 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold text-white border-4 border-transparent group-hover:border-primary group-focus:border-primary transition-colors"
              style={{ backgroundColor: profile.color }}
            >
              {profile.initials}
            </div>
            <span className="text-sm lg:text-base text-muted-foreground group-hover:text-foreground group-focus:text-foreground transition-colors">
              {profile.name}
            </span>
          </a>
        ))}

        <div
          className="profile-card flex flex-col items-center gap-3 outline-none cursor-pointer group"
          tabIndex={0}
        >
          <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full flex items-center justify-center border-4 border-border group-hover:border-primary group-focus:border-primary transition-colors bg-card">
            <Plus className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm lg:text-base text-muted-foreground group-hover:text-foreground transition-colors">
            Adicionar
          </span>
        </div>
      </div>
    </div>
  );
}
