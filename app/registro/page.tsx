"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <AuthCard title="Crear cuenta">
        <RegisterForm />
        <footer className="text-[var(--ink-muted)] text-sm text-center">
          <Link href="/login" className="text-[var(--primary)] no-underline hover:underline">
            Ya tengo cuenta
          </Link>
        </footer>
      </AuthCard>
    </div>
  );
}
