import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import logoImg from "@/assets/logo-central-play.png";
import { iptvLoginFn } from "@/functions/iptv.functions";
import { Loader2 } from "lucide-react";

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
    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Demo mode — skip server call and go straight to home
      if (username.trim() === "demo" && password.trim() === "demo") {
        sessionStorage.clear();
        sessionStorage.setItem("app_session_token", "demo_session_token");
        navigate({ to: "/home" });
        return;
      }
      const result = await loginFn({
        data: { username: username.trim(), password: password.trim() },
      });
      if (result.success) {
        sessionStorage.clear();
        sessionStorage.setItem("app_session_token", result.appSessionToken);
        navigate({ to: "/home" });
      } else {
        // User-friendly error messages
        const errMsg = result.error || "";
        if (errMsg.toLowerCase().includes("expirad")) {
          setError("Acesso expirado. Renove seu plano para continuar.");
        } else {
          setError("Usuário ou senha inválidos.");
        }
      }
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="tv-shell items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #111e35 70%, #0c1a2e 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #2a9af0 0%, transparent 70%)" }}
      />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="mb-2">
          <img
            src={logoImg}
            alt="Central Play Plus"
            className="w-28 h-28 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7f99] mb-1.5 uppercase tracking-widest">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-[#0f1e35]/80 border border-[#1a2e48] px-5 text-base text-[#e8edf4] placeholder:text-[#3a4a60] focus:border-[#2a9af0]/50 focus:bg-[#0f1e35] transition-all outline-none"
              placeholder="Digite seu usuário"
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7f99] mb-1.5 uppercase tracking-widest">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tv-input w-full h-14 rounded-xl bg-[#0f1e35]/80 border border-[#1a2e48] px-5 text-base text-[#e8edf4] placeholder:text-[#3a4a60] focus:border-[#2a9af0]/50 focus:bg-[#0f1e35] transition-all outline-none"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tv-btn w-full h-14 rounded-xl bg-[#2a9af0] hover:bg-[#3aabff] text-white text-lg font-bold disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-[#2a9af0]/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <p className="text-[10px] text-[#3a4a60] text-center mt-2">
          Navegue com as setas do controle remoto · Pressione OK para selecionar
        </p>
      </form>
    </div>
  );
}
