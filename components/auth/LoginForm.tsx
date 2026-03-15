"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PrimaryButton } from "@/components/ui/Buttons";
import { Alert } from "@/components/ui/Alert";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";
import { getMfaResolverFromError } from "@/lib/auth/mfa";
import { MFAChallenge } from "./MFAChallenge";
import type { MultiFactorResolver } from "firebase/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoHint, setShowDemoHint] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  let redirectTo = "/inicio";
  if (rawRedirect) {
    try {
      const decoded = decodeURIComponent(rawRedirect);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) redirectTo = decoded;
    } catch {
      // URL mal formada: mantener /inicio
    }
  }
  const isDemo = getDemoMode();

  // Evitar hidratación distinta: el mensaje demo solo se muestra en cliente tras montar
  useEffect(() => {
    setShowDemoHint(getDemoMode());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isDemo) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email || "demo@precisar.local", password }),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError("No pudimos iniciar sesión. Intenta de nuevo.");
          setLoading(false);
          return;
        }
        router.push(redirectTo);
        router.refresh();
        setLoading(false);
        return;
      }

      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El inicio de sesión no está disponible en este momento. Si el problema continúa, contacta a soporte.");
        setLoading(false);
        return;
      }

      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/multi-factor-auth-required") {
        const requireMfaRes = await fetch(`/api/auth/require-mfa?email=${encodeURIComponent(email)}`);
        const { requireMfa } = await requireMfaRes.json().catch(() => ({ requireMfa: false }));
        if (!requireMfa) {
          setError("Tu cuenta tiene verificación en dos pasos. Solo los administradores usan este flujo. Contacta a soporte si necesitas acceso.");
          setLoading(false);
          return;
        }
        const resolver = await getMfaResolverFromError(err);
        if (resolver) {
          setError("");
          setMfaResolver(resolver);
        } else {
          setError("Se requiere verificación en dos pasos pero no se pudo iniciar. Intenta de nuevo.");
        }
        setLoading(false);
        return;
      }
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (msg.includes("Invalid") || msg.includes("invalid") || msg.includes("incorrect")) {
        setError("Correo o contraseña incorrectos. Revisa e intenta de nuevo.");
      } else if (msg.includes("network") || msg.includes("Network") || (err as Error)?.name === "TypeError") {
        setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      } else {
        setError("No pudimos iniciar sesión. Intenta de nuevo o contacta a soporte.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const authInstance = getFirebaseAuth();
      if (!authInstance) {
        setError("El inicio de sesión no está disponible.");
        setLoading(false);
        return;
      }
      const { signInWithPopup, OAuthProvider } = await import("firebase/auth");
      const provider = new OAuthProvider("microsoft.com");
      const userCred = await signInWithPopup(authInstance, provider);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar con Microsoft";
      setError(msg.includes("popup") ? "Se cerró la ventana de Microsoft. Intenta de nuevo." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSuccess = async (userCredential: import("firebase/auth").UserCredential) => {
    setLoading(true);
    setError("");
    try {
      const idToken = await userCredential.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear sesión");
    } finally {
      setLoading(false);
    }
  };

  if (mfaResolver) {
    return (
      <div className="space-y-4">
        {error && <Alert message={error} variant="error" className="mb-2" />}
        <MFAChallenge
          resolver={mfaResolver}
          onSuccess={handleMfaSuccess}
          onError={setError}
        />
        <p className="text-sm text-center">
          <button
            type="button"
            onClick={() => setMfaResolver(null)}
            className="text-[var(--primary)] hover:underline"
          >
            Volver a correo y contraseña
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showDemoHint && (
        <p className="text-sm text-[var(--muted)] bg-[var(--surface-soft)] border border-[var(--line)] rounded-xl px-3 py-2">
          Modo demo: escribe cualquier correo y contraseña y pulsa Entrar.
        </p>
      )}
      <label className="block">
        <span className="text-[var(--ink)] text-sm font-medium">Correo</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input-base mt-1.5 block w-full min-h-[48px]"
          aria-invalid={!!error}
        />
      </label>
      <label className="block">
        <span className="text-[var(--ink)] text-sm font-medium">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input-base mt-1.5 block w-full min-h-[48px]"
          aria-invalid={!!error}
        />
      </label>
      {error && <Alert message={error} variant="error" className="mb-2" />}
      <PrimaryButton type="submit" disabled={loading} className="w-full min-h-[48px]">
        {loading ? "Entrando…" : "Entrar"}
      </PrimaryButton>
      {!isDemo && (
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--surface)] px-2 text-[var(--muted)]">o</span>
          </div>
        </div>
      )}
      {!isDemo && (
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-medium hover:bg-[var(--bg)] disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" aria-hidden>
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Iniciar con Microsoft (gob.mx)
        </button>
      )}
      <p className="text-[var(--muted)] text-sm text-center">
        <Link href="/soporte?tema=contraseña" className="text-[var(--primary)] no-underline hover:underline">
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
