"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <AuthCard title="Iniciar sesión">
        <LoginForm />
        <footer className="text-[var(--ink-muted)] text-sm text-center">
          <Link href="/" className="text-[var(--primary)] no-underline hover:underline">
            Volver al inicio
          </Link>
        </footer>
      </AuthCard>
    </div>
  );
}
