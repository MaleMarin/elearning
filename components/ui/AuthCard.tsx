"use client";

import { SurfaceCard } from "./SurfaceCard";

export interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Card centrada para login/registro. Max-width 420–480px, mismo fondo global que la plataforma.
 */
export function AuthCard({ title, children, footer, className = "" }: AuthCardProps) {
  return (
    <SurfaceCard
      padding="lg"
      size="lg"
      clickable={false}
      className={`max-w-[480px] w-full mx-auto ${className}`}
    >
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">
        {title}
      </h1>
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 pt-4 border-t border-[var(--line)]">{footer}</div>}
    </SurfaceCard>
  );
}
