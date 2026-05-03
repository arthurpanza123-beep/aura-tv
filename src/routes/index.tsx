import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import logoImg from "@/assets/logo-central-play.png";
import { iptvLoginFn } from "@/server/iptv.functions";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginFn = useServerFn(iptvLoginFn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Preencha usuário e senha");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await loginFn({ data: { username, password } });
      if (result.success) {
        // Store credentials in sessionStorage (never DNS/URLs)
        sessionStorage.setItem("iptv_user", username);
        sessionStorage.setItem("iptv_pass", password);
        if (result.user) {
          sessionStorage.setItem("iptv_exp", result.user.expDate || "");
        }
        navigate({ to: "/profiles" });
      } else {
        setError(result.error || "Credenciais inválidas");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro ao conectar. Tente novamente.");
    } finally {
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
          <p className="text-[#c0392b] text-sm font-semibold">{error}</p>
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
