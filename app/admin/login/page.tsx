"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";
import { getMfaResolverFromError } from "@/lib/auth/mfa";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import TwoFactorSetup from "@/components/admin/TwoFactorSetup";
import type { MultiFactorResolver } from "firebase/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [needsMfaVerify, setNeedsMfaVerify] = useState(false);
  const router = useRouter();
  const isDemo = getDemoMode();

  const finishLogin = async (idToken: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "Error al crear sesión");
    const meRes = await fetch("/api/auth/me", { credentials: "include" });
    const meData = await meRes.json().catch(() => ({}));
    if (meData.mfaEnabled === true) {
      setNeedsMfaVerify(true);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  const handleMfaSuccess = async (userCredential: import("firebase/auth").UserCredential) => {
    setLoading(true);
    setError("");
    try {
      const idToken = await userCredential.user.getIdToken();
      await finishLogin(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al completar el acceso");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMfaResolver(null);
    try {
      if (isDemo) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email || "admin@demo.com",
            password: password || "demo123",
            role: "admin",
          }),
          credentials: "include",
        });
        if (!res.ok) {
          setError("Correo o contraseña incorrectos.");
          return;
        }
        router.push("/admin");
        router.refresh();
        return;
      }
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El inicio de sesión no está disponible.");
        return;
      }
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      await finishLogin(idToken);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/multi-factor-auth-required") {
        const requireMfaRes = await fetch(`/api/auth/require-mfa?email=${encodeURIComponent(email)}`);
        const { requireMfa } = await requireMfaRes.json().catch(() => ({ requireMfa: false }));
        if (!requireMfa) {
          setError("Se requiere verificación en dos pasos. Solo cuentas de administrador pueden continuar aquí.");
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
        setError("Correo o contraseña incorrectos.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (needsMfaVerify) {
    return (
      <>
        <style>{adminLoginStyles}</style>
        <div className="admin-login-page">
          <div className="admin-login-box">
            <div className="admin-login-form">
              <div className="admin-login-logo">
                <div className="admin-login-logo-mark">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                    <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
                  </svg>
                </div>
                <div>
                  <span className="admin-login-logo-name">Política Digital</span>
                  <span className="admin-login-logo-sub">Admin · Verificación 2FA</span>
                </div>
              </div>
              <TwoFactorSetup onComplete={() => { router.push("/admin"); router.refresh(); }} />
              <p className="admin-login-back">
                <Link href="/login" className="admin-login-back-link">← Volver al login</Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (mfaResolver) {
    return (
      <>
        <style>{adminLoginStyles}</style>
        <div className="admin-login-page">
          <div className="admin-login-box">
            <div className="admin-login-form">
              <div className="admin-login-logo">
                <div className="admin-login-logo-mark">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                    <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
                  </svg>
                </div>
                <div>
                  <span className="admin-login-logo-name">Política Digital</span>
                  <span className="admin-login-logo-sub">Admin · Verificación en dos pasos</span>
                </div>
              </div>
              <div className="admin-login-eyebrow">Código de tu app</div>
              <div className="admin-login-title">Introduce el código de 6 dígitos</div>
              {error && <p className="admin-login-error" role="alert">{error}</p>}
              <MFAChallenge resolver={mfaResolver} onSuccess={handleMfaSuccess} onError={setError} />
              <p className="admin-login-back">
                <button type="button" className="admin-login-back-link" onClick={() => setMfaResolver(null)} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
                  ← Volver a correo y contraseña
                </button>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminLoginStyles}</style>
      <div className="admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-form">
            <div className="admin-login-logo">
              <div className="admin-login-logo-mark">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                  <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
                </svg>
              </div>
              <div>
                <span className="admin-login-logo-name">Política Digital</span>
                <span className="admin-login-logo-sub">Admin · Innovación Pública</span>
              </div>
            </div>
            <div className="admin-login-eyebrow">Acceso administrador</div>
            <div className="admin-login-title">Ingresa a tu cuenta</div>
            <div className="admin-login-subtitle">Solo personal autorizado</div>
            {isDemo && (
              <p className="admin-login-demo-hint">
                Modo demo: usa <strong>admin@demo.com</strong> / <strong>demo123</strong>
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="admin-login-field">
                <label className="admin-login-label" htmlFor="admin-email">Correo</label>
                <input
                  id="admin-email"
                  className="admin-login-input"
                  type="email"
                  placeholder="admin@ejemplo.gob.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="admin-login-field">
                <label className="admin-login-label" htmlFor="admin-password">Contraseña</label>
                <input
                  id="admin-password"
                  className="admin-login-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="admin-login-error" role="alert">{error}</p>
              )}
              <button className="admin-login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="admin-login-spinner" aria-hidden />
                    Ingresando…
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
            <p className="admin-login-back">
              <Link href="/login" className="admin-login-back-link">← Volver al login de alumnos</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const adminLoginStyles = `
  .admin-login-page {
    font-family: var(--font-heading);
    background: #f0f2f5 !important;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .admin-login-box {
    width: 100%;
    max-width: 420px;
    background: #f0f2f5;
    border-radius: 24px;
    box-shadow: 10px 10px 22px rgba(174,183,194,0.65), -10px -10px 22px rgba(255,255,255,0.88);
    padding: 40px 36px;
  }
  .admin-login-form {
    display: flex;
    flex-direction: column;
  }
  .admin-login-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }
  .admin-login-logo-mark {
    width: 38px;
    height: 38px;
    background: #f0f2f5;
    border-radius: 10px;
    box-shadow: 4px 4px 10px rgba(174,183,194,0.6), -4px -4px 10px rgba(255,255,255,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .admin-login-logo-name { font-size: 13px; font-weight: 700; color: #1428d4; line-height: 1.2; display: block; }
  .admin-login-logo-sub { font-size: 10px; color: #9ca3af; letter-spacing: 0.06em; display: block; }
  .admin-login-eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: #00e5a0; margin-bottom: 8px;
  }
  .admin-login-title {
    font-size: 22px; font-weight: 300; color: #1428d4;
    letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 4px;
  }
  .admin-login-subtitle { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }
  .admin-login-demo-hint {
    font-size: 12px;
    color: #6b7280;
    background: rgba(0,229,160,0.08);
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .admin-login-demo-hint strong { color: #1428d4; }
  .admin-login-field { margin-bottom: 14px; }
  .admin-login-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9ca3af;
    margin-bottom: 7px; display: block;
  }
  .admin-login-input {
    width: 100%;
    height: 44px;
    background: #f0f2f5;
    border: none;
    border-radius: 12px;
    box-shadow: inset 4px 4px 10px rgba(174,183,194,0.55), inset -4px -4px 10px rgba(255,255,255,0.85);
    padding: 0 16px;
    font-size: 13px;
    font-family: var(--font-heading);
    color: #1428d4;
    outline: none;
  }
  .admin-login-input:focus {
    box-shadow:
      inset 4px 4px 10px rgba(174,183,194,0.55),
      inset -4px -4px 10px rgba(255,255,255,0.85),
      0 0 0 2px rgba(0,229,160,0.3);
  }
  .admin-login-input::placeholder { color: #b0bac9; }
  .admin-login-error {
    font-size: 13px;
    color: #b91c1c;
    margin-bottom: 12px;
  }
  .admin-login-btn {
    width: 100%;
    height: 46px;
    background: #f0f2f5;
    border: none;
    border-radius: 12px;
    box-shadow: 4px 4px 10px rgba(174,183,194,0.6), -4px -4px 10px rgba(255,255,255,0.85);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-heading);
    color: #1428d4;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: box-shadow 0.15s, transform 0.1s;
  }
  .admin-login-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 14px rgba(174,183,194,0.6), -6px -6px 14px rgba(255,255,255,0.88);
    transform: translateY(-1px);
  }
  .admin-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .admin-login-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(20,40,212,0.2);
    border-top-color: #1428d4;
    border-radius: 50%;
    animation: admin-login-spin 0.7s linear infinite;
  }
  @keyframes admin-login-spin { to { transform: rotate(360deg); } }
  .admin-login-back {
    margin-top: 20px;
    text-align: center;
  }
  .admin-login-back-link {
    font-size: 12px;
    color: #1428d4;
    text-decoration: none;
    opacity: 0.8;
  }
  .admin-login-back-link:hover { opacity: 1; text-decoration: underline; }
`;
