"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demo = getDemoMode();
    setIsDemo(demo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemo) {
      try {
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
        window.location.href = "/inicio";
        return;
      } catch {
        setError("No pudimos crear la cuenta. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("El registro no está disponible en este momento. Si el problema continúa, contacta a soporte.");
      setLoading(false);
      return;
    }

    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    try {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-0" noValidate={isDemo}>
      {isDemo && (
        <p className="neu-reg-subtitle" style={{ marginBottom: 16, background: "rgba(0,229,160,0.08)", padding: "8px 12px", borderRadius: 10 }}>
          Modo demo: usa cualquier correo y contraseña.
        </p>
      )}
      <div className="neu-reg-field">
        <label className="neu-reg-label" htmlFor="reg-name">Nombre (opcional)</label>
        <input
          id="reg-name"
          className="neu-reg-input"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          placeholder="Tu nombre"
          aria-invalid={!!error}
        />
      </div>
      <div className="neu-reg-field">
        <label className="neu-reg-label" htmlFor="reg-email">Correo</label>
        <input
          id="reg-email"
          className="neu-reg-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isDemo}
          autoComplete="email"
          placeholder={isDemo ? "Cualquier correo (demo)" : "nombre@institución.gob.mx"}
          aria-invalid={!!error}
        />
      </div>
      <div className="neu-reg-field">
        <label className="neu-reg-label" htmlFor="reg-password">Contraseña</label>
        <input
          id="reg-password"
          className="neu-reg-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isDemo}
          minLength={isDemo ? undefined : 6}
          autoComplete="new-password"
          placeholder={isDemo ? "Cualquier contraseña (demo)" : "Mínimo 6 caracteres"}
          aria-invalid={!!error}
        />
        {!isDemo && <p style={{ marginTop: 6, fontSize: 11, color: "#9ca3af" }}>Mínimo 6 caracteres</p>}
      </div>
      {error && (
        <p className="neu-reg-subtitle" style={{ color: "#b91c1c", marginBottom: 12 }} role="alert">{error}</p>
      )}
      <button type="submit" className="neu-reg-btn" disabled={loading}>
        {loading ? (
          <>
            <div className="neu-reg-spinner" aria-hidden />
            Creando cuenta…
          </>
        ) : (
          "Crear cuenta"
        )}
      </button>
      <p className="neu-reg-subtitle" style={{ marginTop: 16, marginBottom: 0, textAlign: "center" }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" style={{ color: "#1428d4", textDecoration: "none" }}>Iniciar sesión</Link>
      </p>
    </form>
  );
}
