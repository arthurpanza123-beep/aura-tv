import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulated login — ready for future API integration
    await new Promise((r) => setTimeout(r, 800));

    if (username && password) {
      navigate({ to: "/home" });
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]" style={{ backgroundColor: "var(--tv-glow)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: "var(--tv-glow)" }} />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-lg mx-auto px-8 py-12 flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={logoUrl}
            alt="Central Play Plus"
            className="w-32 h-32 object-contain drop-shadow-[0_0_30px_oklch(0.55_0.2_260_/_40%)]"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Central Play <span className="text-primary">Plus</span>
          </h1>
        </div>

        {/* Fields */}
        <div className="w-full flex flex-col gap-5">
          <div className="w-full">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-card border-2 border-border px-5 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary"
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-card border-2 border-border px-5 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary"
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm font-medium animate-in fade-in">
            Usuário ou senha inválidos
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="tv-btn w-full h-16 rounded-xl bg-primary text-primary-foreground text-xl font-bold tracking-wide hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Navegue com as setas do controle remoto
        </p>
      </form>
    </div>
  );
}

import logoImg from "@/assets/logo.png";
const logoUrl = logoImg;
