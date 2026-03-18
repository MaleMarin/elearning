"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";
import { getMfaResolverFromError } from "@/lib/auth/mfa";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import type { MultiFactorResolver } from "firebase/auth";

const LOGO_PD = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const LOGO_GOOGLE = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LOGO_MICROSOFT = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect x="1" y="1" width="10" height="10" fill="#f25022" />
    <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
    <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
    <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
  </svg>
);

export default function LoginPage() {
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
      /* invalid redirect */
    }
  }
  const isDemo = getDemoMode();

  useEffect(() => {
    setShowDemoHint(getDemoMode());
  }, []);

  const handleDemoClick = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@precisar.local", password: "demo", demo: true }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "No pudimos iniciar sesión en demo. Intenta de nuevo.");
        return;
      }
      // Recarga completa para que el navegador envíe la cookie en la siguiente petición
      window.location.href = redirectTo;
    } catch {
      setError("No pudimos iniciar sesión en demo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
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
        if (!res.ok) {
          setError("No pudimos iniciar sesión. Intenta de nuevo.");
          return;
        }
        router.push(redirectTo);
        router.refresh();
        return;
      }
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El inicio de sesión no está disponible. Contacta a soporte si el problema continúa.");
        return;
      }
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, email }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          setError((loginData as { error?: string }).error ?? "Cuenta bloqueada por demasiados intentos.");
          return;
        }
        throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      }
      window.location.href = redirectTo;
      return;
    } catch (err) {
      if (!getDemoMode() && email) {
        const failRes = await fetch("/api/auth/login-failed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }).catch(() => null);
        if (failRes?.status === 429) {
          const data = await failRes.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Cuenta bloqueada por 15 minutos.");
          return;
        }
      }
      const code = (err as { code?: string })?.code;
      if (code === "auth/multi-factor-auth-required") {
        const requireMfaRes = await fetch(`/api/auth/require-mfa?email=${encodeURIComponent(email)}`);
        const { requireMfa } = await requireMfaRes.json().catch(() => ({ requireMfa: false }));
        if (!requireMfa) {
          setError("Tu cuenta tiene verificación en dos pasos. Solo los administradores usan este flujo. Contacta a soporte si necesitas acceso.");
          return;
        }
        const resolver = await getMfaResolverFromError(err);
        if (resolver) {
          setError("");
          setMfaResolver(resolver);
        } else {
          setError("Se requiere verificación en dos pasos. Intenta de nuevo.");
        }
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
      if (!res.ok) throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      window.location.href = redirectTo;
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isDemo) return;
    setLoading(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El inicio de sesión no está disponible. Contacta a soporte si el problema continúa.");
        setLoading(false);
        return;
      }
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      window.location.href = redirectTo;
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar con Google";
      setError(msg.includes("popup") ? "Se cerró la ventana de Google. Intenta de nuevo." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (isDemo) return;
    setLoading(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El inicio de sesión no está disponible. Contacta a soporte si el problema continúa.");
        setLoading(false);
        return;
      }
      const { signInWithPopup, OAuthProvider } = await import("firebase/auth");
      const provider = new OAuthProvider("microsoft.com");
      const userCred = await signInWithPopup(auth, provider);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      window.location.href = redirectTo;
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar con Microsoft";
      setError(msg.includes("popup") ? "Se cerró la ventana de Microsoft. Intenta de nuevo." : msg);
    } finally {
      setLoading(false);
    }
  };

  if (mfaResolver) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#e8eaf0", padding: 24 }}>
        <div style={{ background: "#e8eaf0", borderRadius: 24, boxShadow: "8px 8px 24px #c2c8d6, -8px -8px 24px #ffffff", padding: 40, maxWidth: 400, width: "100%" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1428d4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Verificación en dos pasos</p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, color: "#0a0f8a", marginBottom: 8 }}>Código de verificación</h1>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 16 }}>Ingresa el código de tu aplicación de autenticación</p>
          {error && <p style={{ fontSize: 13, color: "#b91c1c", marginBottom: 12 }} role="alert">{error}</p>}
          <MFAChallenge resolver={mfaResolver} onSuccess={handleMfaSuccess} onError={setError} />
          <button
            type="button"
            onClick={() => setMfaResolver(null)}
            style={{ marginTop: 20, background: "transparent", border: "1.5px solid #c2c8d6", borderRadius: 12, padding: "10px 20px", fontFamily: "var(--font-heading)", fontSize: 13, color: "#0a0f8a", cursor: "pointer" }}
          >
            Volver a correo y contraseña
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .login-form-col input::placeholder { color: #b0b8c8; }
        @media (max-width: 767px) {
          .login-card { flex-direction: column; max-width: 100%; height: auto; min-height: 580px; }
          .login-panel-azul { display: none; }
          .login-form-col { width: 100%; }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8eaf0",
          padding: "40px 24px",
        }}
      >
        <div
          className="login-card"
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 820,
            minHeight: 580,
            height: "auto",
            borderRadius: 24,
            boxShadow: "8px 8px 24px #c2c8d6, -8px -8px 24px #ffffff",
          }}
        >
          {/* Panel izquierdo azul */}
          <div
            className="login-panel-azul"
            style={{
              width: "45%",
              background: "linear-gradient(145deg, #1428d4, #0a0f8a)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 32px",
              animation: "slideFromLeft 0.6s ease-out",
              gap: 20,
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1428d4" }}>
              {LOGO_PD}
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: "#ffffff", textAlign: "center", margin: 0 }}>
              ¿Primera vez aquí?
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center", margin: 0, maxWidth: 260 }}>
              Únete al programa de formación para servidores públicos de México.
            </p>
            <Link
              href="/registro"
              style={{
                border: "1.5px solid rgba(255,255,255,0.6)",
                borderRadius: 50,
                color: "#ffffff",
                padding: "10px 28px",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 700,
                background: "transparent",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Crear cuenta →
            </Link>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5a0" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            </div>
          </div>

          {/* Panel derecho formulario */}
          <div
            className="login-form-col"
            style={{
              flex: 1,
              background: "#e8eaf0",
              padding: "40px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
              animation: "fadeInRight 0.6s ease-out 0.2s both",
              overflowY: "visible",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#e8eaf0",
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1428d4",
                }}
              >
                {LOGO_PD}
              </div>
              <div>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1428d4", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                  BIENVENIDO DE VUELTA
                </p>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 800, color: "#0a0f8a", margin: "4px 0 0 0" }}>
                  Ingresa a tu cuenta
                </h1>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#8892b0", margin: "0 0 8px 0" }}>Continúa donde lo dejaste</p>
            {searchParams.get("reason") === "inactividad" && (
              <p style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 600, margin: 0 }} role="alert">
                Tu sesión cerró por inactividad. Por seguridad, vuelve a ingresar.
              </p>
            )}

            <button
              type="button"
              onClick={handleDemoClick}
              disabled={loading}
              style={{
                display: "block",
                textAlign: "center",
                background: "linear-gradient(135deg, #00e5a0, #00c98a)",
                color: "#0a0f8a",
                borderRadius: 50,
                padding: "11px 20px",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 800,
                boxShadow: "4px 4px 12px rgba(0,229,160,0.4), -3px -3px 8px #ffffff",
                width: "100%",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                boxSizing: "border-box",
              }}
              aria-label="Entrar en modo demo sin cuenta"
            >
              {loading ? "Entrando…" : "Modo demo — entrar sin cuenta"}
            </button>
            {showDemoHint && (
              <p style={{ fontSize: 12, color: "#8892b0", margin: 0 }}>En demo puedes usar cualquier correo y contraseña.</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || isDemo}
                aria-label="Iniciar sesión con Google"
                style={{
                  flex: 1,
                  background: "#e8eaf0",
                  border: "none",
                  borderRadius: 12,
                  padding: 10,
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                  fontFamily: "var(--font-heading)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4a5580",
                  cursor: loading || isDemo ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseDown={(e) => { if (!loading && !isDemo) e.currentTarget.style.boxShadow = "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff"; }}
                onMouseUp={(e) => { e.currentTarget.style.boxShadow = "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"; }}
              >
                {LOGO_GOOGLE}
                Google
              </button>
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading || isDemo}
                aria-label="Iniciar sesión con Microsoft"
                style={{
                  flex: 1,
                  background: "#e8eaf0",
                  border: "none",
                  borderRadius: 12,
                  padding: 10,
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                  fontFamily: "var(--font-heading)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4a5580",
                  cursor: loading || isDemo ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseDown={(e) => { if (!loading && !isDemo) e.currentTarget.style.boxShadow = "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff"; }}
                onMouseUp={(e) => { e.currentTarget.style.boxShadow = "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"; }}
              >
                {LOGO_MICROSOFT}
                Microsoft
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#c2c8d6" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#8892b0" }}>o con correo</span>
              <div style={{ flex: 1, height: 1, background: "#c2c8d6" }} />
            </div>

            <form onSubmit={handleSignIn} noValidate={isDemo}>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="login-email" style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#8892b0", letterSpacing: "1.5px", marginBottom: 6 }}>
                  Correo institucional
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder={isDemo ? "Cualquier correo (demo)" : "nombre@institución.gob.mx"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!isDemo}
                  autoComplete="email"
                  aria-invalid={!!error}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#e8eaf0",
                    boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontFamily: "var(--font-heading)",
                    fontSize: 13,
                    color: "#0a0f8a",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff, 0 0 0 2px rgba(20,40,212,0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff";
                  }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#8892b0", letterSpacing: "1.5px", marginBottom: 6 }}>
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder={isDemo ? "Cualquier contraseña (demo)" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isDemo}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#e8eaf0",
                    boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontFamily: "var(--font-heading)",
                    fontSize: 13,
                    color: "#0a0f8a",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff, 0 0 0 2px rgba(20,40,212,0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff";
                  }}
                />
              </div>
              <div style={{ textAlign: "right", marginBottom: 8 }}>
                <Link href="/soporte?tema=contraseña" style={{ fontSize: 12, color: "#1428d4", textDecoration: "none" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              {error && (
                <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 8px 0" }} role="alert">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 14,
                  padding: 13,
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: "5px 5px 14px rgba(10,15,138,0.4), -3px -3px 9px rgba(255,255,255,0.7)",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.filter = "brightness(1.1)"; }}
                onMouseOut={(e) => { e.currentTarget.style.filter = "none"; }}
                onMouseDown={(e) => { if (!loading) e.currentTarget.style.boxShadow = "inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff"; }}
                onMouseUp={(e) => { e.currentTarget.style.boxShadow = "5px 5px 14px rgba(10,15,138,0.4), -3px -3px 9px rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "5px 5px 14px rgba(10,15,138,0.4), -3px -3px 9px rgba(255,255,255,0.7)"; }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} aria-hidden />
                    Ingresando…
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>

            <p style={{ fontSize: 11, color: "#8892b0", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
              <a href="/privacidad" style={{ color: "#1428d4", textDecoration: "none", fontWeight: 700 }}>Aviso de Privacidad</a>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
