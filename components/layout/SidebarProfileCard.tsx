"use client";

import Link from "next/link";
import { User } from "lucide-react";

export interface SidebarProfileCardProps {
  /** Si null, se muestra "Iniciar sesión". */
  user: { email?: string | null } | null;
  onSignOut?: () => void;
}

export function SidebarProfileCard({ user, onSignOut }: SidebarProfileCardProps) {
  if (user) {
    const displayName = user.email?.split("@")[0] ?? "Usuario";
    return (
      <div
        className="rounded-2xl bg-white/80 border border-[var(--canvas-sidebar-border)] p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_2px_8px_rgba(31,36,48,0.05)]"
        role="region"
        aria-label="Perfil"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full bg-[var(--primary)]/15 flex items-center justify-center shrink-0"
            aria-hidden
          >
            <User className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[var(--ink)] font-medium text-sm truncate" title={user.email ?? undefined}>
              {displayName}
            </p>
            <p className="text-[var(--ink-muted)] text-xs truncate" title={user.email ?? undefined}>
              {user.email}
            </p>
          </div>
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-[var(--ink-muted)] hover:bg-[var(--cream)]/80 hover:text-[var(--ink)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-3 px-4 py-3.5 rounded-full min-h-[52px] text-[var(--primary)] font-medium hover:bg-white/60 transition-all duration-200 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas-sidebar)]"
    >
      <User className="w-5 h-5 shrink-0" strokeWidth={2} />
      Iniciar sesión
    </Link>
  );
}
