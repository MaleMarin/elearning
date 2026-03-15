"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";
import { getMfaResolverFromError } from "@/lib/auth/mfa";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import type { MultiFactorResolver } from "firebase/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
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
        window.location.href = redirectTo;
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
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      const loginData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((loginData as { error?: string }).error ?? "Error al crear sesión");
      window.location.href = redirectTo;
      return;
    } catch (err) {
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isDemo) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email?.trim() || "demo@precisar.local",
            password: password || "",
          }),
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "No pudimos crear la sesión. Intenta de nuevo.");
          return;
        }
        window.location.href = redirectTo;
        return;
      }
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("El registro no está disponible. Contacta a soporte si el problema continúa.");
        return;
      }
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al crear sesión");
      window.location.href = "/onboarding/diagnostic";
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("Ese correo ya está registrado. Prueba a iniciar sesión o usa otro correo.");
      } else if (msg.includes("weak-password") || msg.includes("password")) {
        setError("La contraseña es demasiado corta. Usa al menos 6 caracteres.");
      } else {
        setError("No pudimos crear la cuenta. Intenta de nuevo o contacta a soporte.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (mfaResolver) {
    return (
      <div className={styles["neu-page"]}>
        <div className={`${styles["neu-box"]} ${styles["neu-box-mfa"]}`}>
          <div className={`${styles["neu-form"]} ${styles["neu-form-mfa"]}`}>
            <div className={styles["neu-eyebrow"]}>Verificación en dos pasos</div>
            <div className={styles["neu-title"]}>Código de verificación</div>
            <p className={styles["neu-subtitle"]}>Ingresa el código de tu aplicación de autenticación</p>
            {error && (
              <p className={`${styles["neu-subtitle"]} ${styles["neu-subtitle-error"]}`} role="alert">
                {error}
              </p>
            )}
            <MFAChallenge
              resolver={mfaResolver}
              onSuccess={handleMfaSuccess}
              onError={setError}
            />
            <button
              type="button"
              onClick={() => setMfaResolver(null)}
              className={`${styles["neu-panel-btn"]} ${styles["neu-panel-btn-back"]}`}
            >
              Volver a correo y contraseña
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["neu-page"]}>
      <div className={styles["neu-box"]}>
        <div className={`${styles["neu-slider"]}${isActive ? " " + styles.active : ""}`}>
          {/* Slide 1: Ingresar — formulario izquierda, panel derecha */}
          <div className={styles["neu-slide"]}>
            <div className={styles["neu-form"]}>
            <div className={styles["neu-logo"]}>
              <div className={styles["neu-logo-mark"]}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                  <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
                </svg>
              </div>
              <div>
                <span className={styles["neu-logo-name"]}>Política Digital</span>
                <span className={styles["neu-logo-sub"]}>Innovación Pública · México</span>
              </div>
            </div>

            <div className={styles["neu-eyebrow"]}>Bienvenido de vuelta</div>
            <div className={styles["neu-title"]}>Ingresa a tu cuenta</div>
            <div className={styles["neu-subtitle"]}>Continúa donde lo dejaste</div>

            <a
              href="/api/auth/demo"
              className={`${styles["neu-btn"]} ${styles["neu-btn-demo"]}`}
            >
              Modo demo
            </a>

            {showDemoHint && (
              <p className={`${styles["neu-subtitle"]} ${styles["neu-subtitle-hint"]}`}>
                En demo puedes usar cualquier correo y contraseña.
              </p>
            )}

            <div className={styles["neu-social"]}>
              <button
                type="button"
                className={styles["neu-social-btn"]}
                onClick={handleGoogleLogin}
                disabled={loading || isDemo}
                aria-label="Iniciar sesión con Google"
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className={styles["neu-social-btn"]}
                onClick={handleMicrosoftLogin}
                disabled={loading || isDemo}
                aria-label="Iniciar sesión con Microsoft"
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M11.5 2H2v9.5h9.5V2z" fill="#F25022" />
                  <path d="M22 2h-9.5v9.5H22V2z" fill="#7FBA00" />
                  <path d="M11.5 12.5H2V22h9.5v-9.5z" fill="#00A4EF" />
                  <path d="M22 12.5h-9.5V22H22v-9.5z" fill="#FFB900" />
                </svg>
                Microsoft
              </button>
            </div>

            <div className={styles["neu-divider"]}>
              <div className={styles["neu-div-line"]} /><span className={styles["neu-div-text"]}>o con correo</span><div className={styles["neu-div-line"]} />
            </div>

            <form onSubmit={handleSignIn} noValidate={isDemo}>
              <div className={styles["neu-field"]}>
                <label className={styles["neu-label"]} htmlFor="login-email">Correo institucional</label>
                <input
                  id="login-email"
                  className={styles["neu-input"]}
                  type="email"
                  placeholder={isDemo ? "Cualquier correo (demo)" : "nombre@institución.gob.mx"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!isDemo}
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </div>
              <div className={styles["neu-field"]}>
                <label className={styles["neu-label"]} htmlFor="login-password">Contraseña</label>
                <input
                  id="login-password"
                  className={styles["neu-input"]}
                  type="password"
                  placeholder={isDemo ? "Cualquier contraseña (demo)" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isDemo}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                />
              </div>
              <Link href="/soporte?tema=contraseña" className={styles["neu-forgot"]}>¿Olvidaste tu contraseña?</Link>
              {error && (
                <p className={`${styles["neu-subtitle"]} ${styles["neu-subtitle-error"]}`} role="alert">{error}</p>
              )}
              <button className={styles["neu-btn"]} type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className={styles["neu-spinner"]} aria-hidden />
                    Ingresando…
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
              <p className={`${styles["neu-subtitle"]} ${styles["neu-subtitle-admin-wrap"]}`}>
                <Link href="/admin/login" className="text-[var(--primary)] underline hover:no-underline text-sm whitespace-nowrap">
                  ¿Eres administrador? Ingresa aquí
                </Link>
              </p>
            </form>
              </div>
              <div className={styles["neu-panel-wrap"]}>
                <div className={`${styles["neu-panel"]} ${styles["neu-panel-right-half"]}`}>
                  <div className={styles["neu-panel-glow"]} aria-hidden />
                  <div className={`${styles["neu-panel-half"]} ${styles["neu-panel-right"]}`}>
                    <div className={styles["neu-panel-tag"]}>Política Digital · México</div>
                    <div className={styles["neu-panel-title"]}>¿Primera<br />vez aquí?</div>
                    <div className={styles["neu-panel-desc"]}>Únete al programa de formación para servidores públicos de México.</div>
                    <Link href="/registro" className={`${styles["neu-panel-btn"]} ${styles["neu-panel-btn-link"]}`}>Crear cuenta →</Link>
                    <div className={styles["neu-dots"]}><div className={`${styles["neu-dot"]} ${styles.on}`} /><div className={`${styles["neu-dot"]} ${styles.off}`} /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2: Crear cuenta — panel izquierda, formulario derecha */}
            <div className={styles["neu-slide"]}>
              <div className={styles["neu-panel-wrap"]}>
                <div className={`${styles["neu-panel"]} ${styles["neu-panel-left-half"]}`}>
                  <div className={styles["neu-panel-glow"]} aria-hidden />
                  <div className={`${styles["neu-panel-half"]} ${styles["neu-panel-left"]}`}>
                    <div className={styles["neu-panel-tag"]}>Política Digital · México</div>
                    <div className={styles["neu-panel-title"]}>¿Ya tienes<br />cuenta?</div>
                    <div className={styles["neu-panel-desc"]}>Ingresa para continuar donde lo dejaste y seguir aprendiendo.</div>
                    <button type="button" className={styles["neu-panel-btn"]} onClick={() => { setIsActive(false); setError(""); }}>← Ingresar</button>
                    <div className={styles["neu-dots"]}><div className={`${styles["neu-dot"]} ${styles.off}`} /><div className={`${styles["neu-dot"]} ${styles.on}`} /></div>
                  </div>
                </div>
              </div>
              <div className={styles["neu-form"]}>
            <div className={styles["neu-logo"]}>
              <div className={styles["neu-logo-mark"]}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                  <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
                </svg>
              </div>
              <div>
                <span className={styles["neu-logo-name"]}>Política Digital</span>
                <span className={styles["neu-logo-sub"]}>Innovación Pública · México</span>
              </div>
            </div>

            <div className={styles["neu-eyebrow"]}>Únete al programa</div>
            <div className={styles["neu-title"]}>Crea tu cuenta</div>
            <div className={styles["neu-subtitle"]}>Innovación pública desde adentro</div>

            <form onSubmit={handleSignUp}>
              <div className={styles["neu-field"]}>
                <label className={styles["neu-label"]} htmlFor="reg-name">Nombre completo</label>
                <input
                  id="reg-name"
                  className={styles["neu-input"]}
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className={styles["neu-field"]}>
                <label className={styles["neu-label"]} htmlFor="reg-email">Correo institucional</label>
                <input
                  id="reg-email"
                  className={styles["neu-input"]}
                  type="email"
                  placeholder="nombre@institución.gob.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </div>
              <div className={styles["neu-field"]}>
                <label className={styles["neu-label"]} htmlFor="reg-org">Dependencia</label>
                <input
                  id="reg-org"
                  className={styles["neu-input"]}
                  type="text"
                  placeholder="Ej: SHCP, IMSS, SEP..."
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
              <div className={`${styles["neu-field"]} ${styles["neu-field-mb20"]}`}>
                <label className={styles["neu-label"]} htmlFor="reg-password">Contraseña</label>
                <input
                  id="reg-password"
                  className={styles["neu-input"]}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  aria-invalid={!!error}
                />
              </div>
              {error && (
                <p className={`${styles["neu-subtitle"]} ${styles["neu-subtitle-error"]}`} role="alert">{error}</p>
              )}
              <button className={styles["neu-btn"]} type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className={styles["neu-spinner"]} aria-hidden />
                    Creando cuenta…
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
