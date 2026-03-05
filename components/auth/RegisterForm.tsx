"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || undefined } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/no-inscrito");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-[#1F2430] text-sm font-medium">Nombre (opcional)</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          placeholder="Tu nombre"
          className="mt-1.5 block w-full px-4 py-3 rounded-xl border border-[var(--line-subtle)] bg-white text-[#1F2430] min-h-[48px] placeholder:text-[var(--ink-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        />
      </label>
      <label className="block">
        <span className="text-[#1F2430] text-sm font-medium">Correo</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1.5 block w-full px-4 py-3 rounded-xl border border-[var(--line-subtle)] bg-white text-[#1F2430] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        />
      </label>
      <label className="block">
        <span className="text-[#1F2430] text-sm font-medium">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1.5 block w-full px-4 py-3 rounded-xl border border-[var(--line-subtle)] bg-white text-[#1F2430] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        />
        <p className="mt-1 text-[var(--ink-muted)] text-xs">Mínimo 6 caracteres</p>
      </label>
      {error && (
        <p className="text-[var(--error)] text-sm" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="text-[var(--ink-muted)] text-sm text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[var(--primary)] no-underline hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
