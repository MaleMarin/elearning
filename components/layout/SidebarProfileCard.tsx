"use client";

import Link from "next/link";
import { User } from "lucide-react";

export interface SidebarProfileCardProps {
  /** Si null, se muestra "Iniciar sesión". */
  user: { email?: string | null } | null;
  onSignOut?: () => void;
  /** Si false, no se muestra el botón Cerrar sesión dentro de la card (para mostrarlo aparte en el sidebar). */
  showSignOutButton?: boolean;
}

export function SidebarProfileCard({ user, onSignOut, showSignOutButton = true }: SidebarProfileCardProps) {
  if (user) {
    const displayName = user.email?.split("@")[0] ?? "Usuario";
    return (
      <div
        className="rounded-2xl p-4"
        role="region"
        aria-label="Perfil"
        style={{
          background: "#e8eaf0",
          boxShadow: "inset 3px 3px 6px #c2c8d6, inset -3px -3px 6px #ffffff",
          border: "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#e8eaf0", boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff", color: "#1428d4" }}
            aria-hidden
          >
            <User className="w-5 h-5" style={{ color: "#1428d4" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate" style={{ color: "#0a0f8a" }} title={user.email ?? undefined}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: "#8892b0" }} title={user.email ?? undefined}>
              {user.email}
            </p>
          </div>
        </div>
        {showSignOutButton && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm mt-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1428d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8eaf0]"
            style={{ color: "#4a5580", fontFamily: "'Syne', sans-serif" }}
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
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl min-h-[48px] font-medium transition-all duration-200 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1428d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8eaf0]"
      style={{
        background: "#e8eaf0",
        color: "#1428d4",
        fontFamily: "'Syne', sans-serif",
        fontSize: 13,
        boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
      }}
    >
      <User className="w-5 h-5 shrink-0" strokeWidth={2} style={{ color: "#1428d4" }} />
      Iniciar sesión
    </Link>
  );
}
