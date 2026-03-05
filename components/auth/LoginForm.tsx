"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/ui/Buttons";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/inicio";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("Invalid") || err.message.includes("invalid")
          ? "Correo o contraseña incorrectos. Revisa e intenta de nuevo."
          : err.message
      );
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-[#1F2430] text-sm font-medium">Correo</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input-base mt-1.5 block w-full"
        />
      </label>
      <label className="block">
        <span className="text-[#1F2430] text-sm font-medium">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input-base mt-1.5 block w-full"
        />
      </label>
      {error && <Alert message={error} variant="error" className="mb-2" />}
      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando…" : "Entrar"}
      </PrimaryButton>
      <p className="text-[var(--muted)] text-sm text-center">
        <Link href="/registro" className="text-[var(--primary)] no-underline hover:underline">
          ¿Olvidé mi contraseña?
        </Link>
      </p>
      <p className="text-[var(--muted)] text-sm text-center mt-2">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-[var(--primary)] no-underline hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
