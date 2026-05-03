import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import logoImg from "@/assets/logo-central-play.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login — Central Play Plus" },
      { name: "description", content: "Acesse sua conta Central Play Plus" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    await new Promise((r) => setTimeout(r, 600));
    if (username && password) {
      window.location.href = "/profiles";
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div
      className="tv-shell items-center justify-center relative"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #111e35 70%, #0c1a2e 100%)" }}
    >
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-6"
      >
        <img
          src={logoImg}
          alt="Central Play Plus"
          className="w-24 h-24 object-contain"
        />

        <div className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6b7f99] mb-1.5 uppercase tracking-wider">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-[#0f1e35] border border-[#1a2e48] px-5 text-base text-[#e8edf4] placeholder:text-[#4a5a70]"
              placeholder="Digite seu usuário"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b7f99] mb-1.5 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-[#0f1e35] border border-[#1a2e48] px-5 text-base text-[#e8edf4] placeholder:text-[#4a5a70]"
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <p className="text-[#c0392b] text-sm font-semibold">Usuário ou senha inválidos</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tv-btn w-full h-14 rounded-xl bg-[#1a5a8a] hover:bg-[#1e6a9e] text-white text-lg font-bold disabled:opacity-60 cursor-pointer transition-all"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-[10px] text-[#4a5a70] text-center">
          Navegue com as setas do controle remoto
        </p>
      </form>
    </div>
  );
}
