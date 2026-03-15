"use client";

import "./registro.css";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegistroPage() {
  return (
    <div className="neu-reg-page">
      <div className="neu-reg-box">
        <div className="neu-reg-form">
          <div className="neu-reg-logo">
            <div className="neu-reg-logo-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <circle cx="10" cy="10" r="8" stroke="#1428d4" strokeWidth="1.2" />
                <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="#1428d4" fillOpacity="0.7" />
              </svg>
            </div>
            <div>
              <span className="neu-reg-logo-name">Política Digital</span>
              <span className="neu-reg-logo-sub">Innovación Pública · México</span>
            </div>
          </div>
          <div className="neu-reg-eyebrow">Únete al programa</div>
          <h1 className="neu-reg-title">Crear cuenta</h1>
          <p className="neu-reg-subtitle">Innovación pública desde adentro</p>
          <RegisterForm />
          <footer className="neu-reg-footer">
            <Link href="/login">Ya tengo cuenta</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
