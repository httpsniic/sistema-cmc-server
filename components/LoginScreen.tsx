import React, { useMemo, useState } from "react";

type Props = {
  onLoginSuccess: (token: string) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  // FORÇA a URL correta por enquanto (para eliminar variável de ambiente como causa)
  const API_BASE = "http://127.0.0.1:10000";

  const [usernameOrEmail, setUsernameOrEmail] = useState("master");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return usernameOrEmail.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [usernameOrEmail, password, loading]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const text = await res.text(); // lê como texto primeiro
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // se não for JSON, a gente mostra o texto
      }

      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}: ${text}`);
        return;
      }

      if (data?.ok !== true) {
        setError(data?.error || "Falha no login");
        return;
      }

      if (!data?.token) {
        setError("Login OK, mas token não retornado.");
        return;
      }

      onLoginSuccess(data.token);
    } catch (err: any) {
      // mostra o erro real do fetch (CORS, Failed to fetch, etc)
      setError(`Erro de conexão: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial, sans-serif" }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: 420,
          padding: 24,
          borderRadius: 16,
          border: "1px solid #eee",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          background: "#fff",
        }}
      >
        <h1 style={{ margin: 0, color: "#2f63ff" }}>Controle Financeiro</h1>
        <div style={{ marginTop: 6, marginBottom: 18, color: "#666" }}>Entrar no sistema</div>

        <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Usuário ou Email</label>
        <input
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ddd", marginBottom: 14 }}
        />

        <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ddd", marginBottom: 14 }}
        />

        {error ? (
          <div style={{ background: "#ffe6e6", border: "1px solid #ffb3b3", color: "#a40000", padding: 10, borderRadius: 10, marginBottom: 12, fontSize: 14 }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            background: "#2f63ff",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div style={{ marginTop: 14, fontSize: 12, color: "#777" }}>
          API: <strong>{API_BASE}</strong>
        </div>
      </form>
    </div>
  );
}
