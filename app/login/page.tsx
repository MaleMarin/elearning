"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="card-white p-6 max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSignIn} className="space-y-4">
        <label className="block text-base">
          <span className="text-[var(--text)]">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] min-h-[48px]"
          />
        </label>
        <label className="block text-base">
          <span className="text-[var(--text)]">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] min-h-[48px]"
          />
        </label>
        {message && (
          <p className="text-[var(--error)] text-sm" role="alert">
            {message}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="text-[var(--text-muted)] text-sm mt-4">
        ¿Olvidaste tu contraseña? Configura el redirect en Supabase Auth y añade la opción aquí.
      </p>
    </div>
  );
}
